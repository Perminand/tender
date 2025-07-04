package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.dto.tender.TenderItemDto;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TenderServiceImpl implements TenderService {

    private final TenderRepository tenderRepository;
    private final TenderItemRepository tenderItemRepository;
    private final RequestRepository requestRepository;
    private final CompanyRepository companyRepository;
    private final SupplierProposalService supplierProposalService;
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
        
        Tender savedTender = tenderRepository.save(tender);
        
        // Создаем позиции тендера на основе заявки
        if (tender.getRequest() != null) {
            createTenderItemsFromRequest(savedTender, tender.getRequest());
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
        
        // Получаем все предложения для тендера
        List<SupplierProposalDto> proposals = supplierProposalService.getProposalsByTender(tenderId);
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
} 