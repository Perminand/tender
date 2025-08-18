package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.dto.tender.TenderItemDto;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.ProposalItemDto;
import ru.perminov.tender.mapper.TenderMapper;
import ru.perminov.tender.mapper.TenderItemMapper;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.TenderItem;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.model.RequestMaterial;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.repository.TenderItemRepository;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.WarehouseRepository;
import ru.perminov.tender.service.TenderService;
import ru.perminov.tender.service.SupplierProposalService;
import ru.perminov.tender.service.NotificationService;
import ru.perminov.tender.service.PriceAnalysisService;
import ru.perminov.tender.service.AuditLogService;
import ru.perminov.tender.service.AdditionalExpenseService;
import ru.perminov.tender.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import ru.perminov.tender.model.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import ru.perminov.tender.repository.ProposalItemRepository;
import ru.perminov.tender.model.ProposalItem;
import ru.perminov.tender.mapper.company.CompanyMapper;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TenderServiceImpl implements TenderService {

    private final TenderRepository tenderRepository;
    private final TenderItemRepository tenderItemRepository;
    private final RequestRepository requestRepository;
    private final CompanyRepository companyRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierProposalService supplierProposalService;
    private final NotificationService notificationService;
    private final PriceAnalysisService priceAnalysisService;
    private final TenderMapper tenderMapper;
    private final TenderItemMapper tenderItemMapper;
    private final ProposalItemRepository proposalItemRepository;
    private final CompanyMapper companyMapper;
    private final AuditLogService auditLogService;
    private final AdditionalExpenseService additionalExpenseService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public TenderDto createTender(TenderDto tenderDto) {
        log.info("Создание тендера с данными: {}", tenderDto);
        
        Tender tender = tenderMapper.toEntity(tenderDto);
        
        // Устанавливаем статус по умолчанию
        tender.setStatus(Tender.TenderStatus.DRAFT);
        
        // Генерируем номер тендера если не указан
        if (tender.getTenderNumber() == null || tender.getTenderNumber().isEmpty()) {
            tender.setTenderNumber("T-" + System.currentTimeMillis());
        }

        // Устанавливаем заявку по requestId
        if (tenderDto.getRequestId() != null) {
            log.info("Установка заявки для тендера: requestId={}", tenderDto.getRequestId());
            Request request = requestRepository.findById(tenderDto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Заявка не найдена с ID: " + tenderDto.getRequestId()));
            tender.setRequest(request);
            log.info("Заявка установлена для тендера: {}", request.getRequestNumber());
        } else {
            log.warn("RequestId не указан для тендера");
        }

        // Устанавливаем заказчика по customerId
        if (tenderDto.getCustomerId() != null) {
            Company customer = companyRepository.findById(tenderDto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Заказчик не найден"));
            tender.setCustomer(customer);
        }

        // Устанавливаем склад по warehouseId
        if (tenderDto.getWarehouseId() != null) {
            ru.perminov.tender.model.Warehouse warehouse = warehouseRepository.findById(tenderDto.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Склад не найден"));
            tender.setWarehouse(warehouse);
        }

        // Устанавливаем срок подачи
        if (tenderDto.getSubmissionDeadline() != null) {
            tender.setSubmissionDeadline(tenderDto.getSubmissionDeadline());
        } else {
            tender.setSubmissionDeadline(LocalDateTime.now().plusDays(7));
        }
        
        Tender savedTender = tenderRepository.save(tender);
        auditLogService.logSimple(getCurrentUser(), "CREATE_TENDER", "Tender", savedTender.getId().toString(), "Создан тендер");
        
        // Корректно загружаем заявку с материалами по id
        if (tenderDto.getRequestId() != null) {
            Request request = requestRepository.findByIdWithMaterials(tenderDto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));
            
            // Если склад не указан явно, берем его из заявки
            if (savedTender.getWarehouse() == null && request.getWarehouse() != null) {
                savedTender.setWarehouse(request.getWarehouse());
                savedTender = tenderRepository.save(savedTender);
            }
            
            createTenderItemsFromRequest(savedTender, request);
        }
        
        return tenderMapper.toDto(savedTender);
    }

    @Override
    public TenderDto updateTender(UUID id, TenderDto tenderDto) {
        Tender existingTender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        // Проверяем, что тендер можно редактировать
        if (existingTender.getStatus() != Tender.TenderStatus.DRAFT) {
            throw new RuntimeException("Можно редактировать только черновик тендера. Текущий статус: " + existingTender.getStatus());
        }
        
        // Обновляем только разрешенные поля
        existingTender.setTitle(tenderDto.getTitle());
        existingTender.setDescription(tenderDto.getDescription());
        existingTender.setStartDate(tenderDto.getStartDate());
        existingTender.setEndDate(tenderDto.getEndDate());
        existingTender.setSubmissionDeadline(tenderDto.getSubmissionDeadline());
        existingTender.setRequirements(tenderDto.getRequirements());
        existingTender.setTermsAndConditions(tenderDto.getTermsAndConditions());
        
        Tender updatedTender = tenderRepository.save(existingTender);
        auditLogService.logSimple(getCurrentUser(), "UPDATE_TENDER", "Tender", updatedTender.getId().toString(), "Обновлен тендер");
        return tenderMapper.toDto(updatedTender);
    }

    @Override
    @Transactional(readOnly = true)
    public TenderDto getTenderById(UUID id) {
        Tender tender = tenderRepository.findByIdWithItemsAndUnits(id);
        if (tender == null) throw new RuntimeException("Тендер не найден");
        TenderDto dto = tenderMapper.toDto(tender);
        
        // Заполняем awardedSupplier если есть awardedSupplierId
        if (tender.getAwardedSupplierId() != null) {
            Company awardedSupplier = companyRepository.findById(tender.getAwardedSupplierId()).orElse(null);
            if (awardedSupplier != null) {
                dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
            }
        }
        
        // Добавляем пометки в title
        if (tender.getParentTender() != null) {
            dto.setTitle(dto.getTitle() + " (отделённая часть)");
        } else if (tenderRepository.existsByParentTenderId(tender.getId())) {
            dto.setTitle(dto.getTitle() + " (разделён)");
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderDto> getAllTenders() {
        List<Tender> tenders = tenderRepository.findAll();
        return tenders.stream()
                .map(tender -> {
                    TenderDto dto = tenderMapper.toDto(tender);
                    
                    // Заполняем awardedSupplier если есть awardedSupplierId
                    if (tender.getAwardedSupplierId() != null) {
                        Company awardedSupplier = companyRepository.findById(tender.getAwardedSupplierId()).orElse(null);
                        if (awardedSupplier != null) {
                            dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
                        }
                    }
                    
                    int count = supplierProposalService.getProposalsByTender(tender.getId()).size();
                    dto.setProposalsCount(count);
                    // Добавляем пометки в title
                    if (tender.getParentTender() != null) {
                        dto.setTitle(dto.getTitle() + " (отделённая часть)");
                    } else if (tenderRepository.existsByParentTenderId(tender.getId())) {
                        dto.setTitle(dto.getTitle() + " (разделён)");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderDto> getTendersByStatus(Tender.TenderStatus status) {
        List<Tender> tenders = tenderRepository.findByStatus(status);
        return tenders.stream()
                .map(tender -> {
                    TenderDto dto = tenderMapper.toDto(tender);
                    
                    // Заполняем awardedSupplier если есть awardedSupplierId
                    if (tender.getAwardedSupplierId() != null) {
                        Company awardedSupplier = companyRepository.findById(tender.getAwardedSupplierId()).orElse(null);
                        if (awardedSupplier != null) {
                            dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
                        }
                    }
                    
                    int count = supplierProposalService.getProposalsByTender(tender.getId()).size();
                    dto.setProposalsCount(count);
                    // Добавляем пометки в title
                    if (tender.getParentTender() != null) {
                        dto.setTitle(dto.getTitle() + " (отделённая часть)");
                    } else if (tenderRepository.existsByParentTenderId(tender.getId())) {
                        dto.setTitle(dto.getTitle() + " (разделён)");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderDto> getTendersByCustomer(UUID customerId) {
        List<Tender> tenders = tenderRepository.findByCustomerId(customerId);
        return tenders.stream()
                .map(tender -> {
                    TenderDto dto = tenderMapper.toDto(tender);
                    
                    // Заполняем awardedSupplier если есть awardedSupplierId
                    if (tender.getAwardedSupplierId() != null) {
                        Company awardedSupplier = companyRepository.findById(tender.getAwardedSupplierId()).orElse(null);
                        if (awardedSupplier != null) {
                            dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
                        }
                    }
                    
                    int count = supplierProposalService.getProposalsByTender(tender.getId()).size();
                    dto.setProposalsCount(count);
                    // Добавляем пометки в title
                    if (tender.getParentTender() != null) {
                        dto.setTitle(dto.getTitle() + " (отделённая часть)");
                    } else if (tenderRepository.existsByParentTenderId(tender.getId())) {
                        dto.setTitle(dto.getTitle() + " (разделён)");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTender(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        // Проверяем, что тендер можно удалить
        if (tender.getStatus() != Tender.TenderStatus.DRAFT) {
            throw new RuntimeException("Можно удалить только черновик тендера");
        }
        
        tenderRepository.delete(tender);
    }

    @Override
    public TenderDto publishTender(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        if (tender.getStatus() != Tender.TenderStatus.DRAFT) {
            throw new RuntimeException("Можно опубликовать только черновик тендера");
        }
        
        tender.setStatus(Tender.TenderStatus.PUBLISHED);
        tender.setStartDate(LocalDateTime.now());
        
        Tender savedTender = tenderRepository.save(tender);
        auditLogService.logSimple(getCurrentUser(), "PUBLISH_TENDER", "Tender", savedTender.getId().toString(), "Тендер опубликован");
        
        // Отправляем уведомления поставщикам и заказчикам о публикации тендера
        try {
            notificationService.notifyTenderPublishedToSuppliers(savedTender);
            notificationService.notifyTenderPublishedToCustomers(savedTender);
        } catch (Exception e) {
            log.error("Ошибка отправки уведомлений о публикации тендера: {}", id, e);
        }
        
        TenderDto dto = tenderMapper.toDto(savedTender);
        
        // Заполняем awardedSupplier если есть awardedSupplierId
        if (savedTender.getAwardedSupplierId() != null) {
            Company awardedSupplier = companyRepository.findById(savedTender.getAwardedSupplierId()).orElse(null);
            if (awardedSupplier != null) {
                dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
            }
        }
        
        return dto;
    }

    @Override
    public TenderDto closeTender(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        if (tender.getStatus() != Tender.TenderStatus.BIDDING) {
            throw new RuntimeException("Можно закрыть только тендер в статусе приема предложений");
        }
        
        tender.setStatus(Tender.TenderStatus.EVALUATION);
        tender.setEndDate(LocalDateTime.now());
        
        Tender savedTender = tenderRepository.save(tender);
        auditLogService.logSimple(getCurrentUser(), "CLOSE_TENDER", "Tender", savedTender.getId().toString(), "Тендер закрыт");
        
        // Обновляем статус всех предложений (кроме отклоненных) на ACCEPTED
        try {
            supplierProposalService.acceptAllProposalsForTender(id);
            log.info("Успешно обновлен статус предложений для тендера {}", id);
        } catch (Exception e) {
            log.error("Ошибка при обновлении статуса предложений для тендера {}: {}", id, e.getMessage());
            // Не прерываем выполнение, так как основная операция завершена успешно
        }
        
        TenderDto dto = tenderMapper.toDto(savedTender);
        
        // Заполняем awardedSupplier если есть awardedSupplierId
        if (savedTender.getAwardedSupplierId() != null) {
            Company awardedSupplier = companyRepository.findById(savedTender.getAwardedSupplierId()).orElse(null);
            if (awardedSupplier != null) {
                dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
            }
        }
        
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierProposalDto> getTenderProposals(UUID tenderId) {
        return supplierProposalService.getProposalsByTender(tenderId);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierProposalDto getBestProposal(UUID tenderId) {
        return supplierProposalService.getBestProposalForTender(tenderId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderItemDto> getTenderItems(UUID tenderId) {
        log.info("Получение элементов тендера для tenderId: {}", tenderId);
        // fetch join для unit
        Tender tender = tenderRepository.findByIdWithItemsAndUnits(tenderId);
        log.info("Найден тендер: {}", tender != null ? tender.getId() : "null");
        
        List<TenderItem> items = tender != null
            ? new ArrayList<>(tender.getTenderItems())
            : new ArrayList<>();
        log.info("Найдено элементов тендера: {}", items.size());
        
        // Логируем единицы измерения в тендерных позициях
        for (TenderItem item : items) {
            log.info("Тендерная позиция: {} - Единица измерения: {} (unitId: {})", 
                    item.getDescription(), 
                    item.getUnit() != null ? item.getUnit().getName() : "null",
                    item.getUnit() != null ? item.getUnit().getId() : "null");
        }
        
        List<TenderItemDto> result = items.stream()
                .map(tenderItemMapper::toDto)
                .collect(Collectors.toList());
        log.info("Преобразовано в DTO: {}", result.size());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public TenderDto getTenderWithBestOffers(UUID tenderId) {
        log.info("Получен запрос на тендер с лучшими предложениями: {}", tenderId);
        
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        TenderDto tenderDto = tenderMapper.toDto(tender);
        
        // Получаем все предложения для тендера с обновленными позициями
        List<SupplierProposalDto> proposals = supplierProposalService.getProposalsByTender(tenderId);
        
        // Обновляем позиции каждого предложения с расчетом лучших цен
        for (SupplierProposalDto proposal : proposals) {
            List<ProposalItemDto> items = supplierProposalService.getProposalItems(proposal.getId());
            proposal.setProposalItems(items);
        }
        
        tenderDto.setSupplierProposals(proposals);
        
        // Получаем все позиции тендера
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tenderId);
        Set<UUID> tenderItemIds = tenderItems.stream()
                .map(TenderItem::getId)
                .collect(Collectors.toSet());
        
        // Фильтруем предложения, которые содержат все позиции тендера
        List<SupplierProposalDto> completeProposals = proposals.stream()
                .filter(proposal -> {
                    Set<UUID> proposalItemIds = proposal.getProposalItems().stream()
                            .map(ProposalItemDto::getTenderItemId)
                            .collect(Collectors.toSet());
                    return proposalItemIds.equals(tenderItemIds);
                })
                .collect(Collectors.toList());
        
        // Находим лучшее предложение среди полных предложений по общей цене с учетом дополнительных расходов
        SupplierProposalDto bestProposal = completeProposals.stream()
                .filter(p -> p.getTotalPrice() != null)
                .min((p1, p2) -> {
                    // Получаем полную стоимость с учетом дополнительных расходов
                    double totalCost1 = calculateTotalProposalCost(p1);
                    double totalCost2 = calculateTotalProposalCost(p2);
                    return Double.compare(totalCost1, totalCost2);
                })
                .orElse(null);
        
        if (bestProposal != null) {
            tenderDto.setBestPrice(bestProposal.getTotalPrice());
            tenderDto.setBestSupplierName(bestProposal.getSupplierName());
            log.info("Найдено лучшее полное предложение: {} от поставщика {} с ценой {}", 
                    bestProposal.getProposalNumber(), bestProposal.getSupplierName(), bestProposal.getTotalPrice());
        } else {
            log.info("Не найдено полных предложений для тендера: {}", tenderId);
        }
        
        tenderDto.setProposalsCount(proposals.size());
        
        // Добавляем пометки в title
        if (tender.getParentTender() != null) {
            tenderDto.setTitle(tenderDto.getTitle() + " (отделённая часть)");
        } else if (tenderRepository.existsByParentTenderId(tender.getId())) {
            tenderDto.setTitle(tenderDto.getTitle() + " (разделён)");
        }
        
        return tenderDto;
    }

    @Override
    @Transactional(readOnly = true)
    public TenderDto getTenderWithBestPricesByItems(UUID id) {
        Tender tender = tenderRepository.findByIdWithItemsAndUnits(id);
        if (tender == null) throw new RuntimeException("Тендер не найден");
        return tenderMapper.toDto(tender);
    }

    @Override
    @Transactional(readOnly = true)
    public TenderDto getTenderForSupplier(UUID tenderId) {
        Tender tender = tenderRepository.findByIdWithItemsAndUnits(tenderId);
        if (tender == null) throw new RuntimeException("Тендер не найден");
        // Проверяем, что тендер доступен для поставщика
        if (tender.getStatus() != Tender.TenderStatus.PUBLISHED && 
            tender.getStatus() != Tender.TenderStatus.BIDDING &&
            tender.getStatus() != Tender.TenderStatus.EVALUATION &&
            tender.getStatus() != Tender.TenderStatus.AWARDED) {
            throw new RuntimeException("Тендер недоступен для просмотра поставщиком");
        }
        TenderDto tenderDto = tenderMapper.toDto(tender);
        // Получаем только предложения текущего поставщика
        // TODO: Получить userId из SecurityContext и найти его предложения
        // Пока возвращаем тендер без предложений
        tenderDto.setSupplierProposals(new ArrayList<>());
        // tenderItems уже загружены fetch join
        // Добавляем пометки в title
        if (tender.getParentTender() != null) {
            tenderDto.setTitle(tenderDto.getTitle() + " (отделённая часть)");
        } else if (tenderRepository.existsByParentTenderId(tender.getId())) {
            tenderDto.setTitle(tenderDto.getTitle() + " (разделён)");
        }
        return tenderDto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderDto> getAllTendersForSupplier() {
        // Получаем все тендеры в подходящих статусах
        List<Tender> allTenders = tenderRepository.findAll();
        
        return allTenders.stream()
                .filter(tender -> 
                    tender.getStatus() == Tender.TenderStatus.PUBLISHED ||
                    tender.getStatus() == Tender.TenderStatus.BIDDING ||
                    tender.getStatus() == Tender.TenderStatus.EVALUATION ||
                    tender.getStatus() == Tender.TenderStatus.AWARDED
                )
                .map(tender -> {
                    TenderDto dto = tenderMapper.toDto(tender);
                    
                    // Заполняем awardedSupplier если есть awardedSupplierId
                    if (tender.getAwardedSupplierId() != null) {
                        Company awardedSupplier = companyRepository.findById(tender.getAwardedSupplierId()).orElse(null);
                        if (awardedSupplier != null) {
                            dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
                        }
                    }
                    
                    // Не показываем предложения поставщику
                    dto.setSupplierProposals(new ArrayList<>());
                    
                    // Добавляем пометки в title
                    if (tender.getParentTender() != null) {
                        dto.setTitle(dto.getTitle() + " (отделённая часть)");
                    } else if (tenderRepository.existsByParentTenderId(tender.getId())) {
                        dto.setTitle(dto.getTitle() + " (разделён)");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public TenderDto startBidding(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        if (tender.getStatus() != Tender.TenderStatus.PUBLISHED) {
            throw new RuntimeException("Можно начать прием предложений только для опубликованного тендера");
        }
        tender.setStatus(Tender.TenderStatus.BIDDING);
        Tender savedTender = tenderRepository.save(tender);
        auditLogService.logSimple(getCurrentUser(), "START_BIDDING", "Tender", savedTender.getId().toString(), "Начат прием предложений");
        
        TenderDto dto = tenderMapper.toDto(savedTender);
        
        // Заполняем awardedSupplier если есть awardedSupplierId
        if (savedTender.getAwardedSupplierId() != null) {
            Company awardedSupplier = companyRepository.findById(savedTender.getAwardedSupplierId()).orElse(null);
            if (awardedSupplier != null) {
                dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
            }
        }
        
        return dto;
    }

    @Override
    public TenderDto completeTender(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        if (tender.getStatus() != Tender.TenderStatus.EVALUATION) {
            throw new RuntimeException("Можно завершить только тендер в статусе оценки");
        }
        tender.setStatus(Tender.TenderStatus.AWARDED);
        Tender savedTender = tenderRepository.save(tender);
        auditLogService.logSimple(getCurrentUser(), "COMPLETE_TENDER", "Tender", savedTender.getId().toString(), "Тендер завершен");
        
        TenderDto dto = tenderMapper.toDto(savedTender);
        
        // Заполняем awardedSupplier если есть awardedSupplierId
        if (savedTender.getAwardedSupplierId() != null) {
            Company awardedSupplier = companyRepository.findById(savedTender.getAwardedSupplierId()).orElse(null);
            if (awardedSupplier != null) {
                dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
            }
        }
        
        return dto;
    }

    @Override
    public TenderDto cancelTender(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        if (tender.getStatus() == Tender.TenderStatus.CANCELLED) {
            throw new RuntimeException("Тендер уже отменен");
        }
        if (tender.getStatus() == Tender.TenderStatus.AWARDED) {
            throw new RuntimeException("Нельзя отменить завершенный тендер");
        }
        tender.setStatus(Tender.TenderStatus.CANCELLED);
        Tender saved = tenderRepository.save(tender);
        auditLogService.logSimple(getCurrentUser(), "CANCEL_TENDER", "Tender", saved.getId().toString(), "Тендер отменен");
        
        TenderDto dto = tenderMapper.toDto(saved);
        
        // Заполняем awardedSupplier если есть awardedSupplierId
        if (saved.getAwardedSupplierId() != null) {
            Company awardedSupplier = companyRepository.findById(saved.getAwardedSupplierId()).orElse(null);
            if (awardedSupplier != null) {
                dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
            }
        }
        
        return dto;
    }

    @Override
    public void awardTenderItem(UUID tenderId, UUID itemId, UUID supplierId) {
        TenderItem item = tenderItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Позиция тендера не найдена"));
        if (!item.getTender().getId().equals(tenderId)) {
            throw new RuntimeException("Позиция не принадлежит данному тендеру");
        }
        item.setAwardedSupplierId(supplierId);
        tenderItemRepository.save(item);
        auditLogService.logSimple(null, "AWARD_TENDER_ITEM", "Tender", tenderId.toString(), "Назначен победитель позиции тендера");
    }

    @Override
    public TenderDto awardTender(UUID tenderId, UUID supplierId) {
        Tender tender = tenderRepository.findById(tenderId)
            .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        if (supplierId == null) {
            tender.setAwardedSupplierId(null);
            tender.setStatus(Tender.TenderStatus.EVALUATION);
        } else {
            tender.setAwardedSupplierId(supplierId);
            // tender.setStatus(Tender.TenderStatus.AWARDED); // Не менять статус!
        }
        Tender saved = tenderRepository.save(tender);
        
        TenderDto dto = tenderMapper.toDto(saved);
        
        // Заполняем awardedSupplier если есть awardedSupplierId
        if (saved.getAwardedSupplierId() != null) {
            Company awardedSupplier = companyRepository.findById(saved.getAwardedSupplierId()).orElse(null);
            if (awardedSupplier != null) {
                dto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
            }
        }
        
        auditLogService.logSimple(null, "AWARD_TENDER", "Tender", tenderId.toString(), "Назначен победитель тендера");
        return dto;
    }

    @Override
    @Transactional
    public TenderDto setTenderStatus(UUID id, String status) {
        Tender tender = tenderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        tender.setStatus(Tender.TenderStatus.valueOf(status));
        tenderRepository.save(tender);
        return tenderMapper.toDto(tender);
    }

    private void createTenderItemsFromRequest(Tender tender, Request request) {
        List<RequestMaterial> requestMaterials = request.getRequestMaterials();
        
        for (int i = 0; i < requestMaterials.size(); i++) {
            RequestMaterial requestMaterial = requestMaterials.get(i);
            
            TenderItem tenderItem = new TenderItem();
            tenderItem.setTender(tender);
            tenderItem.setRequestMaterial(requestMaterial);
            tenderItem.setItemNumber(i + 1);
            // Описание: если material есть, берем его имя, иначе supplierMaterialName или note
            if (requestMaterial.getMaterial() != null && requestMaterial.getMaterial().getName() != null) {
            tenderItem.setDescription(requestMaterial.getMaterial().getName());
            } else if (requestMaterial.getSupplierMaterialName() != null) {
                tenderItem.setDescription(requestMaterial.getSupplierMaterialName());
            } else if (requestMaterial.getNote() != null) {
                tenderItem.setDescription(requestMaterial.getNote());
            } else {
                tenderItem.setDescription("");
            }
            tenderItem.setQuantity(requestMaterial.getQuantity());
            // Копируем unit всегда
            tenderItem.setUnit(requestMaterial.getUnit());
            log.info("Создание тендерной позиции: {} - Единица измерения из заявки: {} (unitId: {})", 
                    requestMaterial.getSupplierMaterialName() != null ? requestMaterial.getSupplierMaterialName() : 
                    (requestMaterial.getMaterial() != null ? requestMaterial.getMaterial().getName() : "Неизвестно"),
                    requestMaterial.getUnit() != null ? requestMaterial.getUnit().getName() : "null",
                    requestMaterial.getUnit() != null ? requestMaterial.getUnit().getId() : "null");
            tenderItem.setSpecifications(requestMaterial.getNote());
            tenderItem.setEstimatedPrice(requestMaterial.getEstimatePrice());
            
            tenderItemRepository.save(tenderItem);
        }
    }

    // Методы для анализа цен
    @Override
    public ru.perminov.tender.dto.tender.PriceAnalysisDto getTenderPriceAnalysis(UUID id) {
        log.info("Получен запрос на анализ цен для тендера: {}", id);
        return priceAnalysisService.getPriceAnalysis(id);
    }

    @Override
    public List<ru.perminov.tender.dto.tender.SupplierPriceDto> getTenderBestPrices(UUID id) {
        log.info("Получен запрос на лучшие цены для тендера: {}", id);
        return priceAnalysisService.getBestPricesByItems(id);
    }

    @Override
    public List<ru.perminov.tender.dto.tender.SupplierPriceDto> getTenderPriceComparison(UUID id) {
        log.info("Получен запрос на сравнительную таблицу цен для тендера: {}", id);
        return priceAnalysisService.getPriceComparison(id);
    }

    @Override
    public Double getTenderSavings(UUID id) {
        log.info("Получен запрос на расчет экономии для тендера: {}", id);
        return priceAnalysisService.calculateSavings(id);
    }

    @Override
    public List<String> getTenderRecommendations(UUID id) {
        log.info("Получен запрос на рекомендации для тендера: {}", id);
        return priceAnalysisService.getSupplierRecommendations(id);
    }

    @Override
    public ru.perminov.tender.dto.tender.TenderSplitResponseDto splitTender(ru.perminov.tender.dto.tender.TenderSplitRequestDto splitRequest) {
        log.info("Начинаем разделение тендера id={}", splitRequest.getTenderId());
        
        // Получаем оригинальный тендер
        Tender originalTender = tenderRepository.findById(splitRequest.getTenderId())
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        // Проверяем, что тендер находится в статусе приема предложений
        if (originalTender.getStatus() != Tender.TenderStatus.BIDDING) {
            throw new RuntimeException("Тендер можно разделить только в статусе 'Прием предложений'. Текущий статус: " + originalTender.getStatus());
        }
        
        // Создаем новый тендер с наследованием основных параметров
        Tender newTender = new Tender();
        newTender.setTenderNumber(originalTender.getTenderNumber() + "-SPLIT-" + System.currentTimeMillis());
        newTender.setTitle(originalTender.getTitle() + " (Часть)");
        newTender.setDescription(originalTender.getDescription());
        newTender.setCustomer(originalTender.getCustomer());
        newTender.setStartDate(originalTender.getStartDate());
        newTender.setEndDate(originalTender.getEndDate());
        newTender.setSubmissionDeadline(originalTender.getSubmissionDeadline());
        newTender.setStatus(originalTender.getStatus()); // Наследуем статус
        newTender.setRequirements(originalTender.getRequirements());
        newTender.setTermsAndConditions(originalTender.getTermsAndConditions());
        newTender.setRequest(originalTender.getRequest());
        newTender.setParentTender(originalTender); // Устанавливаем связь с родительским тендером
        
        // Сохраняем новый тендер
        Tender savedNewTender = tenderRepository.save(newTender);
        
        List<TenderItemDto> originalItems = new ArrayList<>();
        List<TenderItemDto> newItems = new ArrayList<>();
        
        // Обрабатываем каждый запрос на разделение
        for (ru.perminov.tender.dto.tender.TenderSplitRequestDto.TenderItemSplitDto splitDto : splitRequest.getItemSplits()) {
            TenderItem originalItem = tenderItemRepository.findById(splitDto.getItemId())
                    .orElseThrow(() -> new RuntimeException("Позиция тендера не найдена: " + splitDto.getItemId()));
            
            // Проверяем, что запрошенное количество не превышает доступное
            if (splitDto.getSplitQuantity() > originalItem.getQuantity()) {
                throw new RuntimeException("Запрошенное количество превышает доступное для позиции: " + originalItem.getDescription());
            }
            
            // Создаем новую позицию для нового тендера
            TenderItem newItem = new TenderItem();
            newItem.setTender(savedNewTender);
            newItem.setRequestMaterial(originalItem.getRequestMaterial());
            newItem.setItemNumber(originalItem.getItemNumber());
            newItem.setDescription(splitDto.getNewItemDescription() != null ? splitDto.getNewItemDescription() : originalItem.getDescription());
            newItem.setQuantity(splitDto.getSplitQuantity());
            newItem.setUnit(originalItem.getUnit());
            newItem.setSpecifications(originalItem.getSpecifications());
            newItem.setDeliveryRequirements(originalItem.getDeliveryRequirements());
            newItem.setEstimatedPrice(originalItem.getEstimatedPrice()); // Не делим сметную цену
            // Сохраняем новую позицию
            TenderItem savedNewItem = tenderItemRepository.save(newItem);
            // Обновляем оригинальную позицию
            originalItem.setQuantity(originalItem.getQuantity() - splitDto.getSplitQuantity());
            // Не меняем estimatedPrice у оригинальной позиции
            TenderItem savedOriginalItem = tenderItemRepository.save(originalItem);
            
            // Добавляем в списки для ответа
            originalItems.add(tenderItemMapper.toDto(savedOriginalItem));
            newItems.add(tenderItemMapper.toDto(savedNewItem));
        }
        
        // Создаем ответ
        ru.perminov.tender.dto.tender.TenderSplitResponseDto response = new ru.perminov.tender.dto.tender.TenderSplitResponseDto();
        response.setOriginalTenderId(originalTender.getId());
        response.setNewTenderId(savedNewTender.getId());
        response.setNewTenderNumber(savedNewTender.getTenderNumber());
        response.setOriginalItems(originalItems);
        response.setNewItems(newItems);
        response.setMessage("Тендер успешно разделен. Создан новый тендер: " + savedNewTender.getTenderNumber());
        
        log.info("Тендер успешно разделен. Новый тендер: {}", savedNewTender.getId());
        
        return response;
    }
    
    /**
     * Рассчитать полную стоимость предложения с учетом дополнительных расходов
     */
    private double calculateTotalProposalCost(SupplierProposalDto proposal) {
        // Базовая стоимость предложения
        double baseCost = proposal.getTotalPrice() != null ? proposal.getTotalPrice() : 0.0;
        
        // Дополнительные расходы
        double additionalExpenses = additionalExpenseService.getTotalApprovedAmountByProposal(proposal.getId());
        
        double totalCost = baseCost + additionalExpenses;
        
        log.debug("Расчет полной стоимости предложения {}: базовая стоимость: {}, дополнительные расходы: {}, итого: {}", 
                proposal.getId(), baseCost, additionalExpenses, totalCost);
        
        return totalCost;
    }
    
} 