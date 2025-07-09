package ru.perminov.tender.service;

import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.dto.contract.ContractDtoNew;
import ru.perminov.tender.dto.contract.ContractDtoUpdate;
import ru.perminov.tender.dto.contract.ContractItemDto;

import java.util.List;
import java.util.UUID;

public interface ContractService {
    
    /**
     * Создать новый контракт
     */
    ContractDto createContract(ContractDtoNew contractDtoNew);
    
    /**
     * Получить контракт по ID
     */
    ContractDto getContractById(UUID id);
    
    /**
     * Получить все контракты
     */
    List<ContractDto> getAllContracts();
    
    /**
     * Получить контракты по статусу
     */
    List<ContractDto> getContractsByStatus(String status);
    
    /**
     * Получить контракты по поставщику
     */
    List<ContractDto> getContractsBySupplier(UUID supplierId);
    
    /**
     * Обновить контракт
     */
    ContractDto updateContract(UUID id, ContractDtoUpdate contractDtoUpdate);
    
    /**
     * Удалить контракт
     */
    void deleteContract(UUID id);
    
    /**
     * Изменить статус контракта
     */
    ContractDto changeContractStatus(UUID id, String newStatus);
    
    /**
     * Получить позиции контракта
     */
    List<ContractItemDto> getContractItems(UUID contractId);
    
    /**
     * Создать контракт на основе выигранного тендера
     */
    ContractDto createContractFromTender(UUID tenderId, UUID supplierId);
} 