package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Delivery;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, UUID>, JpaSpecificationExecutor<Delivery> {
    
    /**
     * Найти поставки по статусу
     */
    List<Delivery> findByStatus(Delivery.DeliveryStatus status);
    
    /**
     * Найти поставки по контракту
     */
    List<Delivery> findByContractId(UUID contractId);
    
    /**
     * Найти поставки по контракту (через связь)
     */
    List<Delivery> findByContract_Id(UUID contractId);
    
    /**
     * Найти поставки по поставщику
     */
    List<Delivery> findBySupplierId(UUID supplierId);
    
    /**
     * Найти поставки по складу
     */
    List<Delivery> findByWarehouseId(UUID warehouseId);
    
    /**
     * Найти поставку по номеру
     */
    Delivery findByDeliveryNumber(String deliveryNumber);
    
    /**
     * Найти поставки с запланированной датой
     */
    List<Delivery> findByPlannedDeliveryDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * Найти просроченные поставки
     */
    @Query("SELECT d FROM Delivery d WHERE d.plannedDeliveryDate < :currentDate AND d.status IN ('PLANNED', 'IN_TRANSIT')")
    List<Delivery> findOverdueDeliveries(@Param("currentDate") LocalDate currentDate);
    
    /**
     * Найти поставки для приемки
     */
    @Query("SELECT d FROM Delivery d WHERE d.status = 'DELIVERED'")
    List<Delivery> findDeliveriesForAcceptance();
    
    /**
     * Найти все поставки с загрузкой связанных данных
     */
    @Query("SELECT d FROM Delivery d LEFT JOIN FETCH d.contract LEFT JOIN FETCH d.supplier LEFT JOIN FETCH d.warehouse")
    List<Delivery> findAllWithRelations();

    long countByStatus(Delivery.DeliveryStatus status);
} 