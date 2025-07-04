package ru.perminov.tender.service;

import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.ProposalItemDto;
import ru.perminov.tender.model.SupplierProposal;

import java.util.List;
import java.util.UUID;

public interface SupplierProposalService {
    
    SupplierProposalDto createProposal(SupplierProposalDto proposalDto);
    
    SupplierProposalDto updateProposal(UUID id, SupplierProposalDto proposalDto);
    
    SupplierProposalDto getProposalById(UUID id);
    
    List<SupplierProposalDto> getProposalsByTender(UUID tenderId);
    
    List<SupplierProposalDto> getProposalsBySupplier(UUID supplierId);
    
    List<SupplierProposalDto> getProposalsByStatus(SupplierProposal.ProposalStatus status);
    
    void deleteProposal(UUID id);
    
    SupplierProposalDto submitProposal(UUID id);
    
    SupplierProposalDto acceptProposal(UUID id);
    
    SupplierProposalDto rejectProposal(UUID id);
    
    SupplierProposalDto getBestProposalForTender(UUID tenderId);
    
    List<ProposalItemDto> getProposalItems(UUID proposalId);
    
    SupplierProposalDto getProposalWithBestOffers(UUID proposalId);
} 