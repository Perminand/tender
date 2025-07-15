package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.DeliveryItem;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeliveryItemRepository extends JpaRepository<DeliveryItem, UUID> {
    
    /**
     * Найти позиции по поставке
     */
    List<DeliveryItem> findByDeliveryId(UUID deliveryId);
    
    /**
     * Удалить позиции по поставке
     */
    void deleteByDeliveryId(UUID deliveryId);
    
    /**
     * Найти позиции по материалу
     */
    List<DeliveryItem> findByMaterialId(UUID materialId);
    
    /**
     * Найти позиции по статусу качества
     */
    List<DeliveryItem> findByAcceptanceStatus(DeliveryItem.AcceptanceStatus acceptanceStatus);
    
    /**
     * Найти позиции по поставке и материалу
     */
    List<DeliveryItem> findByDeliveryIdAndMaterialId(UUID deliveryId, UUID materialId);
} 