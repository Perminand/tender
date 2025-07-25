package ru.perminov.tender.service;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface ContractRegistryService {
    
    /**
     * Получить все контракты для экспорта
     */
    List<ru.perminov.tender.dto.contract.ContractDto> getAllContracts();
    
    /**
     * Экспортировать все контракты в Excel
     */
    ByteArrayInputStream exportContractsToExcel();
} 