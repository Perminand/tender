package ru.perminov.tender.service;

import ru.perminov.tender.dto.payment.PaymentDto;
import ru.perminov.tender.dto.payment.PaymentDtoNew;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.Map;

public interface PaymentService {
    
    /**
     * Создать новый платеж
     */
    PaymentDto createPayment(PaymentDtoNew paymentDtoNew);
    
    /**
     * Получить платеж по ID
     */
    PaymentDto getPaymentById(UUID id);
    
    /**
     * Получить все платежи
     */
    List<PaymentDto> getAllPayments();
    
    /**
     * Получить платежи по статусу
     */
    List<PaymentDto> getPaymentsByStatus(String status);
    
    /**
     * Получить платежи по контракту
     */
    List<PaymentDto> getPaymentsByContract(UUID contractId);
    
    /**
     * Получить платежи по поставщику
     */
    List<PaymentDto> getPaymentsBySupplier(UUID supplierId);
    
    /**
     * Обновить платеж
     */
    PaymentDto updatePayment(UUID id, PaymentDtoNew paymentDtoNew);
    
    /**
     * Удалить платеж
     */
    void deletePayment(UUID id);
    
    /**
     * Изменить статус платежа
     */
    PaymentDto changePaymentStatus(UUID id, String newStatus);
    
    /**
     * Подтвердить оплату
     */
    PaymentDto confirmPayment(UUID id);
    
    /**
     * Получить общую сумму задолженности по контракту
     */
    BigDecimal getContractDebt(UUID contractId);
    
    /**
     * Получить просроченные платежи
     */
    List<PaymentDto> getOverduePayments();
    
    /**
     * Создать платежи на основе поставок
     */
    List<PaymentDto> createPaymentsFromDeliveries(UUID contractId);

    /**
     * Создать платеж по поставке
     */
    PaymentDto createPaymentFromDelivery(ru.perminov.tender.model.Delivery delivery);

    /**
     * Получить статистику по статусам платежей
     */
    Map<String, Long> getStatusStats();

    /**
     * Получить платежи по поставке
     */
    List<PaymentDto> getPaymentsByDelivery(UUID deliveryId);
} 