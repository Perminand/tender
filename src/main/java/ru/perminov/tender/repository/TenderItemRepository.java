package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.perminov.tender.model.TenderItem;

import java.util.List;
import java.util.UUID;

public interface TenderItemRepository extends JpaRepository<TenderItem, UUID> {
    List<TenderItem> findByTenderId(UUID tenderId);
    
    @Query("SELECT ti FROM TenderItem ti " +
           "LEFT JOIN FETCH ti.unit " +
           "LEFT JOIN FETCH ti.requestMaterial rm " +
           "LEFT JOIN FETCH rm.material m " +
           "LEFT JOIN FETCH rm.characteristic ch " +
           "LEFT JOIN FETCH rm.unit ru " +
           "LEFT JOIN FETCH rm.estimateUnit reu " +
           "WHERE ti.tender.id = :tenderId")
    List<TenderItem> findByTenderIdWithUnit(UUID tenderId);
} 