package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.mapper.RequestMapper;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.model.RequestMaterial;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.service.OrgSupplierMaterialMappingService;
import ru.perminov.tender.service.RequestService;

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
    private final OrgSupplierMaterialMappingService orgSupplierMaterialMappingService;

    @Override
    public List<RequestDto> findAll() {
        List<Request> requests = requestRepository.findAllWithMaterials();
        log.info("Найдено заявок: {}", requests.size());
        for (Request request : requests) {
            log.info("Заявка {}: материалов = {}", request.getId(), request.getMaterials().size());
        }
        return requests.stream()
                .map(requestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public RequestDto findById(UUID id) {
        log.info("Поиск заявки по id: {}", id);
        Request request = requestRepository.findByIdWithMaterials(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        log.info("Найдена заявка: {}, материалов: {}", request.getId(), request.getMaterials().size());
        
        RequestDto requestDto = requestMapper.toDto(request);
        log.info("DTO заявки: {}, материалов в DTO: {}", requestDto.id(), 
                requestDto.materials() != null ? requestDto.materials().size() : 0);
        return requestDto;
    }

    @Override
    public RequestDto create(RequestDto dto) {
        log.info("Создание заявки с {} материалами", dto.materials() != null ? dto.materials().size() : 0);
        Request entity = requestMapper.toEntity(dto);
        // Устанавливаем связь с заявкой для каждого материала
        for (RequestMaterial material : entity.getMaterials()) {
            material.setRequest(entity);
        }
        Request savedRequest = requestRepository.save(entity);
        updateSupplierMaterialMappings(savedRequest);
        return requestMapper.toDto(savedRequest);
    }

    @Override
    public RequestDto update(UUID id, RequestDto dto) {
        log.info("Обновление заявки {} с {} материалами", id, dto.materials() != null ? dto.materials().size() : 0);
        Request existing = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        Request updated = requestMapper.toEntity(dto);
        updated.setId(existing.getId());
        // Устанавливаем связь с заявкой для каждого материала
        for (RequestMaterial material : updated.getMaterials()) {
            material.setRequest(updated);
        }
        Request savedRequest = requestRepository.save(updated);
        updateSupplierMaterialMappings(savedRequest);
        return requestMapper.toDto(savedRequest);
    }

    @Override
    public void delete(UUID id) {
        requestRepository.deleteById(id);
    }
    
    /**
     * Обновляет таблицу соответствий между организацией, наименованием у поставщика и материалом
     */
    private void updateSupplierMaterialMappings(Request request) {
        if (request.getOrganization() == null) {
            return;
        }
        
        for (RequestMaterial material : request.getMaterials()) {
            if (material.getMaterial() != null && 
                material.getSupplierMaterialName() != null && 
                !material.getSupplierMaterialName().trim().isEmpty()) {
                
                // Сохраняем соответствие: организация + наименование у поставщика -> материал
                orgSupplierMaterialMappingService.save(
                    request.getOrganization().getId(),
                    material.getSupplierMaterialName().trim(),
                    material.getMaterial().getId()
                );
            }
        }
    }
} 