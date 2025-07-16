package ru.perminov.tender.service;

import org.springframework.data.domain.Page;
import ru.perminov.tender.dto.delivery.DeliveryDto;
import ru.perminov.tender.dto.delivery.DeliveryDtoNew;
import ru.perminov.tender.dto.delivery.DeliveryItemDto;

import java.util.List;
import java.util.UUID;
import java.util.Map;

public interface DeliveryService {
    
    /**
     * Создать новую поставку
     */
    DeliveryDto createDelivery(DeliveryDtoNew deliveryDtoNew);
    
    /**
     * Получить поставку по ID
     */
    DeliveryDto getDeliveryById(UUID id);
    
    /**
     * Получить все поставки
     */
    List<DeliveryDto> getAllDeliveries();
    
    /**
     * Получить поставки с фильтрами и пагинацией
     */
    Page<DeliveryDto> getDeliveriesWithFilters(int page, int size, String status, String contractId, String supplierId, String dateFrom, String dateTo);
    
    /**
     * Получить поставки по статусу
     */
    List<DeliveryDto> getDeliveriesByStatus(String status);
    
    /**
     * Получить поставки по контракту
     */
    List<DeliveryDto> getDeliveriesByContract(UUID contractId);
    
    /**
     * Получить поставки по поставщику
     */
    List<DeliveryDto> getDeliveriesBySupplier(UUID supplierId);
    
    /**
     * Обновить поставку
     */
    DeliveryDto updateDelivery(UUID id, DeliveryDtoNew deliveryDtoNew);
    
    /**
     * Удалить поставку
     */
    void deleteDelivery(UUID id);
    
    /**
     * Изменить статус поставки
     */
    DeliveryDto changeDeliveryStatus(UUID id, String newStatus, String comment);
    
    /**
     * Получить позиции поставки
     */
    List<DeliveryItemDto> getDeliveryItems(UUID deliveryId);
    
    /**
     * Подтвердить приемку поставки
     */
    DeliveryDto confirmDelivery(UUID id);
    
    /**
     * Отклонить поставку
     */
    DeliveryDto rejectDelivery(UUID id, String reason);

    /**
     * Обновить приемку позиции поставки
     */
    DeliveryItemDto updateDeliveryItemAcceptance(UUID deliveryId, UUID itemId, DeliveryItemDto acceptanceDto);

    /**
     * Получить статистику по статусам
     */
    Map<String, Long> getStatusStats();
} 