package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     * Найти позиции по контракту с загрузкой единиц измерения и материалов
     */
    @Query("SELECT ci FROM ContractItem ci LEFT JOIN FETCH ci.unit LEFT JOIN FETCH ci.material WHERE ci.contract.id = :contractId")
    List<ContractItem> findByContractIdWithUnitsAndMaterials(@Param("contractId") UUID contractId);
    
    /**
     * Найти позиции по материалу
     */
    List<ContractItem> findByMaterialId(UUID materialId);
    
    /**
     * Найти позиции по контракту и материалу
     */
    List<ContractItem> findByContractIdAndMaterialId(UUID contractId, UUID materialId);
} 