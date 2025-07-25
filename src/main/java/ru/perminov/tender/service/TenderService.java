package ru.perminov.tender.service;

import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.dto.tender.TenderItemDto;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.model.Tender;

import java.util.List;
import java.util.UUID;

public interface TenderService {
    
    TenderDto createTender(TenderDto tenderDto);
    
    TenderDto updateTender(UUID id, TenderDto tenderDto);
    
    TenderDto getTenderById(UUID id);
    
    List<TenderDto> getAllTenders();
    
    List<TenderDto> getTendersByStatus(Tender.TenderStatus status);
    
    List<TenderDto> getTendersByCustomer(UUID customerId);
    
    void deleteTender(UUID id);
    
    TenderDto publishTender(UUID id);
    
    TenderDto closeTender(UUID id);
    
    List<SupplierProposalDto> getTenderProposals(UUID tenderId);
    
    SupplierProposalDto getBestProposal(UUID tenderId);
    
    List<TenderItemDto> getTenderItems(UUID tenderId);
    
    TenderDto getTenderWithBestOffers(UUID tenderId);
    
    TenderDto getTenderWithBestPricesByItems(UUID tenderId);

    TenderDto getTenderForSupplier(UUID tenderId);

    List<TenderDto> getAllTendersForSupplier();

    TenderDto startBidding(UUID id);

    TenderDto completeTender(UUID id);

    TenderDto cancelTender(UUID id);

    /**
     * Присвоить победителя позиции тендера
     */
    void awardTenderItem(UUID tenderId, UUID itemId, UUID supplierId);

    /**
     * Присвоить победителя всему тендеру
     */
    TenderDto awardTender(UUID tenderId, UUID supplierId);

    // Методы для анализа цен
    ru.perminov.tender.dto.tender.PriceAnalysisDto getTenderPriceAnalysis(UUID id);
    
    List<ru.perminov.tender.dto.tender.SupplierPriceDto> getTenderBestPrices(UUID id);
    
    List<ru.perminov.tender.dto.tender.SupplierPriceDto> getTenderPriceComparison(UUID id);
    
    Double getTenderSavings(UUID id);
    
    List<String> getTenderRecommendations(UUID id);
    
    /**
     * Разделить тендер на части
     */
    ru.perminov.tender.dto.tender.TenderSplitResponseDto splitTender(ru.perminov.tender.dto.tender.TenderSplitRequestDto splitRequest);

    TenderDto setTenderStatus(UUID id, String status);
} 