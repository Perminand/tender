package ru.perminov.tender.service;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface DeliveryRegistryService {
    
    /**
     * Получить все поставки для экспорта
     */
    List<ru.perminov.tender.dto.delivery.DeliveryDto> getAllDeliveries();
    
    /**
     * Экспортировать все поставки в Excel
     */
    ByteArrayInputStream exportDeliveriesToExcel();
} 