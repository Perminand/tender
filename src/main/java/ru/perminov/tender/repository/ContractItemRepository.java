package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.ContractItem;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContractItemRepository extends JpaRepository<ContractItem, UUID> {
    
    /**
     * Найти позиции по контракту
     */
    List<ContractItem> findByContractId(UUID contractId);
    
    /**
     * Найти позиции по материалу
     */
    List<ContractItem> findByMaterialId(UUID materialId);
    
    /**
     * Найти позиции по контракту и материалу
     */
    List<ContractItem> findByContractIdAndMaterialId(UUID contractId, UUID materialId);
} 