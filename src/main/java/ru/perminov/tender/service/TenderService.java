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
} 