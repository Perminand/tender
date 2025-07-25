package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.dto.RequestMaterialDto;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.mapper.RequestMapper;
import ru.perminov.tender.mapper.RequestMaterialMapper;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.model.RequestMaterial;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.repository.WorkTypeRepository;
import ru.perminov.tender.service.OrgSupplierMaterialMappingService;
import ru.perminov.tender.service.RequestService;
import ru.perminov.tender.service.TenderService;
import ru.perminov.tender.service.AuditLogService;
import ru.perminov.tender.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import ru.perminov.tender.model.User;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RequestServiceImpl implements RequestService {
    private final RequestRepository requestRepository;
    private final RequestMapper requestMapper;
    private final RequestMaterialMapper requestMaterialMapper;
    private final OrgSupplierMaterialMappingService orgSupplierMaterialMappingService;
    private final WorkTypeRepository workTypeRepository;
    private final TenderService tenderService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDto> findAll() {
        List<Request> requests = requestRepository.findAllWithMaterials();
        log.info("Найдено заявок: {}", requests.size());
        for (Request request : requests) {
            log.info("Заявка {}: материалов = {}", request.getId(), request.getRequestMaterials().size());
        }
        return requests.stream()
                .map(requestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RequestDto findById(UUID id) {
        log.info("Поиск заявки по id: {}", id);
        Request request = requestRepository.findByIdWithMaterials(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        log.info("Найдена заявка: {}, материалов: {}", request.getId(), request.getRequestMaterials().size());
        
        RequestDto requestDto = requestMapper.toDto(request);
        log.info("DTO заявки: {}, материалов в DTO: {}", requestDto.id(), 
                requestDto.requestMaterials() != null ? requestDto.requestMaterials().size() : 0);
        return requestDto;
    }

    @Override
    public RequestDto create(RequestDto dto) {
        log.info("Создание заявки с {} материалами", dto.requestMaterials() != null ? dto.requestMaterials().size() : 0);
        Request entity = requestMapper.toEntity(dto);
        updateRequestMaterials(entity, dto);
        Request savedRequest = requestRepository.save(entity);
        updateSupplierMaterialMappings(savedRequest);
        auditLogService.logSimple(getCurrentUser(), "CREATE_REQUEST", "Request", savedRequest.getId().toString(), "Создана заявка");
        return requestMapper.toDto(savedRequest);
    }

    @Override
    public RequestDto update(UUID id, RequestDto dto) {
        log.info("Обновление заявки {} с {} материалами", id, dto.requestMaterials() != null ? dto.requestMaterials().size() : 0);
        try {
            Request request = requestRepository.findByIdWithMaterials(id)
                    .orElseThrow(() -> new IllegalArgumentException("Заявка с ид: " + id + " не найден." ));
            log.info("Найдена заявка для обновления: {}", request.getId());
            
            requestMapper.updateRequestFromDto(dto, request);
            log.info("Обновлены основные поля заявки");
            
            updateRequestMaterials(request, dto);
            log.info("Обновлены материалы заявки");
            
            Request savedRequest = requestRepository.save(request);
            log.info("Заявка сохранена: {}", savedRequest.getId());
            
            updateSupplierMaterialMappings(savedRequest);
            log.info("Обновлены соответствия поставщиков");
            
            RequestDto requestDto = requestMapper.toDto(savedRequest);
            log.info("DTO создан успешно");
            
            auditLogService.logSimple(getCurrentUser(), "UPDATE_REQUEST", "Request", savedRequest.getId().toString(), "Обновлена заявка");
            return requestDto;
        } catch (Exception e) {
            log.error("Ошибка в методе update: ", e);
            throw e;
        }
    }
    
    /**
     * Обновляет материалы заявки
     */
    private void updateRequestMaterials(Request request, RequestDto dto) {
        log.info("Обновляем материалы заявки. Было: {}", request.getRequestMaterials().size());
        request.getRequestMaterials().clear();
        if (dto.requestMaterials() != null && !dto.requestMaterials().isEmpty()) {
            log.info("Добавляем {} новых материалов", dto.requestMaterials().size());
            for (int i = 0; i < dto.requestMaterials().size(); i++) {
                RequestMaterialDto materialDto = dto.requestMaterials().get(i);
                log.info("Обрабатываем материал {}: id={}, materialLink={}", i, materialDto.id(), materialDto.materialLink());
                
                // Валидация цен и количества
                if (materialDto.quantity() != null && materialDto.quantity() <= 0) {
                    throw new RuntimeException("Количество должно быть больше 0");
                }
                if (materialDto.estimatePrice() != null && materialDto.estimatePrice() <= 0) {
                    throw new RuntimeException("Сметная цена должна быть больше 0");
                }
                
                try {
                    RequestMaterial material = requestMaterialMapper.toEntity(materialDto);
                    log.info("Материал создан через маппер: id={}, materialLink={}", material.getId(), material.getMaterialLink());
                    
                    material.setRequest(request);
                    if (materialDto.workType() != null && materialDto.workType().getId() != null) {
                        material.setWorkType(
                            workTypeRepository.findById(materialDto.workType().getId())
                                .orElseThrow(() -> new IllegalArgumentException("WorkType not found"))
                        );
                    } else {
                        material.setWorkType(null);
                    }
                    request.getRequestMaterials().add(material);
                    log.info("Материал {} добавлен в заявку", i);
                } catch (Exception e) {
                    log.error("Ошибка при обработке материала {}: ", i, e);
                    throw e;
                }
            }
        } else {
            log.info("Новых материалов нет");
        }
    }

    @Override
    public void delete(UUID id) {
        requestRepository.deleteById(id);
        auditLogService.logSimple(getCurrentUser(), "DELETE_REQUEST", "Request", id.toString(), "Удалена заявка");
    }

    @Override
    public TenderDto createTenderFromRequest(UUID requestId) {
        log.info("Создание тендера из заявки: {}", requestId);
        
        // Получаем заявку с материалами
        Request request = requestRepository.findByIdWithMaterials(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Заявка не найдена"));
        
        // Проверяем, что заявка не пустая
        if (request.getRequestMaterials() == null || request.getRequestMaterials().isEmpty()) {
            throw new IllegalArgumentException("Заявка не содержит материалов");
        }
        
        // Создаем DTO для тендера
        TenderDto tenderDto = new TenderDto();
        tenderDto.setRequestId(requestId);
        tenderDto.setTitle("Тендер по заявке " + request.getRequestNumber());
        tenderDto.setDescription("Тендер создан на основе заявки " + request.getRequestNumber());
        tenderDto.setCustomerId(request.getOrganization().getId());
        tenderDto.setCustomerName(request.getOrganization().getName());
        // Устанавливаем срок подачи: если есть дата заявки, то +7 дней, иначе текущая дата + 7 дней
        if (request.getDate() != null) {
            tenderDto.setSubmissionDeadline(request.getDate().atStartOfDay().plusDays(7));
        } else {
            tenderDto.setSubmissionDeadline(java.time.LocalDateTime.now().plusDays(7));
        }
        
        // Создаем тендер через сервис
        TenderDto createdTender = tenderService.createTender(tenderDto);
        
        // Обновляем статус заявки на 'TENDER'
        log.info("Текущий статус заявки {}: {}", requestId, request.getStatus());
        request.setStatus("TENDER");
        log.info("Установлен новый статус заявки {}: {}", requestId, request.getStatus());
        requestRepository.save(request);
        requestRepository.flush(); // Явно сохраняем изменения
        log.info("Статус заявки {} обновлен на 'TENDER'", requestId);
        
        log.info("Тендер успешно создан из заявки. TenderId: {}", createdTender.getId());
        
        return createdTender;
    }
    
    /**
     * Обновляет таблицу соответствий между организацией, наименованием у поставщика и материалом
     */
    private void updateSupplierMaterialMappings(Request request) {
        if (request.getOrganization() == null) {
            return;
        }
        
        for (RequestMaterial material : request.getRequestMaterials()) {
            if (material.getMaterial() != null && 
                material.getSupplierMaterialName() != null && 
                !material.getSupplierMaterialName().trim().isEmpty()) {
                
                // Сохраняем соответствие: организация + наименование в заявке -> материал
                orgSupplierMaterialMappingService.save(
                    request.getOrganization().getId(),
                    material.getSupplierMaterialName().trim(),
                    material.getMaterial().getId(),
                    material.getCharacteristic() != null ? material.getCharacteristic().getId() : null
                );
            }
        }
    }
} 