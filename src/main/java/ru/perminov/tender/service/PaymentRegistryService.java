package ru.perminov.tender.service;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface PaymentRegistryService {
    
    /**
     * Получить все платежи для экспорта
     */
    List<ru.perminov.tender.dto.payment.PaymentDto> getAllPayments();
    
    /**
     * Экспортировать все платежи в Excel
     */
    ByteArrayInputStream exportPaymentsToExcel();
} 