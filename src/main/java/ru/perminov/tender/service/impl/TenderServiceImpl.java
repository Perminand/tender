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
import ru.perminov.tender.service.TenderService;
import ru.perminov.tender.service.SupplierProposalService;
import ru.perminov.tender.service.NotificationService;
import ru.perminov.tender.service.PriceAnalysisService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TenderServiceImpl implements TenderService {

    private final TenderRepository tenderRepository;
    private final TenderItemRepository tenderItemRepository;
    private final RequestRepository requestRepository;
    private final CompanyRepository companyRepository;
    private final SupplierProposalService supplierProposalService;
    private final NotificationService notificationService;
    private final PriceAnalysisService priceAnalysisService;
    private final TenderMapper tenderMapper;
    private final TenderItemMapper tenderItemMapper;

    @Override
    public TenderDto createTender(TenderDto tenderDto) {
        Tender tender = tenderMapper.toEntity(tenderDto);
        
        // Устанавливаем статус по умолчанию
        tender.setStatus(Tender.TenderStatus.DRAFT);
        
        // Генерируем номер тендера если не указан
        if (tender.getTenderNumber() == null || tender.getTenderNumber().isEmpty()) {
            tender.setTenderNumber("T-" + System.currentTimeMillis());
        }

        // Устанавливаем заказчика по customerId
        if (tenderDto.getCustomerId() != null) {
            Company customer = companyRepository.findById(tenderDto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Заказчик не найден"));
            tender.setCustomer(customer);
        }

        // Устанавливаем срок подачи
        if (tenderDto.getSubmissionDeadline() != null) {
            tender.setSubmissionDeadline(tenderDto.getSubmissionDeadline());
        } else {
            tender.setSubmissionDeadline(LocalDateTime.now().plusDays(7));
        }
        
        Tender savedTender = tenderRepository.save(tender);
        
        // Корректно загружаем заявку с материалами по id
        if (tenderDto.getRequestId() != null) {
            Request request = requestRepository.findByIdWithMaterials(tenderDto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));
            createTenderItemsFromRequest(savedTender, request);
        }
        
        return tenderMapper.toDto(savedTender);
    }

    @Override
    public TenderDto updateTender(UUID id, TenderDto tenderDto) {
        Tender existingTender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        // Обновляем только разрешенные поля
        existingTender.setTitle(tenderDto.getTitle());
        existingTender.setDescription(tenderDto.getDescription());
        existingTender.setStartDate(tenderDto.getStartDate());
        existingTender.setEndDate(tenderDto.getEndDate());
        existingTender.setSubmissionDeadline(tenderDto.getSubmissionDeadline());
        existingTender.setRequirements(tenderDto.getRequirements());
        existingTender.setTermsAndConditions(tenderDto.getTermsAndConditions());
        
        Tender updatedTender = tenderRepository.save(existingTender);
        return tenderMapper.toDto(updatedTender);
    }

    @Override
    @Transactional(readOnly = true)
    public TenderDto getTenderById(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        return tenderMapper.toDto(tender);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderDto> getAllTenders() {
        List<Tender> tenders = tenderRepository.findAll();
        return tenders.stream()
                .map(tenderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderDto> getTendersByStatus(Tender.TenderStatus status) {
        List<Tender> tenders = tenderRepository.findByStatus(status);
        return tenders.stream()
                .map(tenderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenderDto> getTendersByCustomer(UUID customerId) {
        List<Tender> tenders = tenderRepository.findByCustomerId(customerId);
        return tenders.stream()
                .map(tenderMapper::toDto)
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
        
        // Отправляем уведомления поставщикам и заказчикам о публикации тендера
        try {
            notificationService.notifyTenderPublishedToSuppliers(savedTender);
            notificationService.notifyTenderPublishedToCustomers(savedTender);
        } catch (Exception e) {
            log.error("Ошибка отправки уведомлений о публикации тендера: {}", id, e);
        }
        
        return tenderMapper.toDto(savedTender);
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
        return tenderMapper.toDto(savedTender);
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
        List<TenderItem> items = tenderItemRepository.findByTenderId(tenderId);
        return items.stream()
                .map(tenderItemMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TenderDto getTenderWithBestOffers(UUID tenderId) {
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
        
        // Находим лучшее предложение по общей цене
        SupplierProposalDto bestProposal = proposals.stream()
                .filter(p -> p.getTotalPrice() != null)
                .min((p1, p2) -> Double.compare(p1.getTotalPrice(), p2.getTotalPrice()))
                .orElse(null);
        
        if (bestProposal != null) {
            tenderDto.setBestPrice(bestProposal.getTotalPrice());
            tenderDto.setBestSupplierName(bestProposal.getSupplierName());
        }
        
        tenderDto.setProposalsCount(proposals.size());
        
        return tenderDto;
    }

    @Override
    @Transactional(readOnly = true)
    public TenderDto getTenderWithBestPricesByItems(UUID tenderId) {
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        TenderDto tenderDto = tenderMapper.toDto(tender);
        
        // Получаем все предложения для тендера
        List<SupplierProposalDto> proposals = supplierProposalService.getProposalsByTender(tenderId);
        tenderDto.setSupplierProposals(proposals);
        
        // Получаем лучшие цены по позициям
        Map<UUID, Double> bestPricesByItems = supplierProposalService.getBestPricesByTenderItems(tenderId);
        
        // Обновляем позиции тендера с лучшими ценами
        if (tenderDto.getTenderItems() != null) {
            for (TenderItemDto item : tenderDto.getTenderItems()) {
                Double bestPrice = bestPricesByItems.get(item.getId());
                item.setBestPrice(bestPrice); // всегда явно присваиваем (null если нет)
            }
        }
        
        // Находим лучшее предложение по общей цене
        SupplierProposalDto bestProposal = proposals.stream()
                .filter(p -> p.getTotalPrice() != null)
                .min((p1, p2) -> Double.compare(p1.getTotalPrice(), p2.getTotalPrice()))
                .orElse(null);
        
        if (bestProposal != null) {
            tenderDto.setBestPrice(bestProposal.getTotalPrice());
            tenderDto.setBestSupplierName(bestProposal.getSupplierName());
        }
        
        tenderDto.setProposalsCount(proposals.size());
        
        return tenderDto;
    }

    @Override
    public TenderDto startBidding(UUID id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        if (tender.getStatus() != Tender.TenderStatus.PUBLISHED) {
            throw new RuntimeException("Можно начать прием предложений только для опубликованного тендера");
        }
        tender.setStatus(Tender.TenderStatus.BIDDING);
        tenderRepository.save(tender);
        return tenderMapper.toDto(tender);
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
        return tenderMapper.toDto(savedTender);
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
        return tenderMapper.toDto(saved);
    }

    private void createTenderItemsFromRequest(Tender tender, Request request) {
        List<RequestMaterial> requestMaterials = request.getRequestMaterials();
        
        for (int i = 0; i < requestMaterials.size(); i++) {
            RequestMaterial requestMaterial = requestMaterials.get(i);
            
            TenderItem tenderItem = new TenderItem();
            tenderItem.setTender(tender);
            tenderItem.setRequestMaterial(requestMaterial);
            tenderItem.setItemNumber(i + 1);
            tenderItem.setDescription(requestMaterial.getMaterial().getName());
            tenderItem.setQuantity(requestMaterial.getQuantity());
            tenderItem.setUnit(requestMaterial.getUnit());
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
    
} 