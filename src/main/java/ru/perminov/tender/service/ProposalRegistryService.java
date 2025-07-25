package ru.perminov.tender.service;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface ProposalRegistryService {
    
    /**
     * Получить все предложения для экспорта
     */
    List<ru.perminov.tender.dto.tender.SupplierProposalDto> getAllProposals();
    
    /**
     * Экспортировать все предложения в Excel
     */
    ByteArrayInputStream exportProposalsToExcel();
} 