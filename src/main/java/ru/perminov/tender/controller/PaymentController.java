package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.payment.PaymentDto;
import ru.perminov.tender.dto.payment.PaymentDtoNew;
import ru.perminov.tender.service.PaymentService;
import ru.perminov.tender.repository.DeliveryRepository;
import jakarta.persistence.EntityNotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import ru.perminov.tender.model.Delivery;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;
    private final DeliveryRepository deliveryRepository;

    @PostMapping
    public ResponseEntity<PaymentDto> createPayment(@RequestBody PaymentDtoNew paymentDtoNew) {
        log.info("Создание платежа: {}", paymentDtoNew);
        return ResponseEntity.ok(paymentService.createPayment(paymentDtoNew));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto> getPaymentById(@PathVariable UUID id) {
        log.info("Получение платежа по id: {}", id);
        PaymentDto dto = paymentService.getPaymentById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
        log.info("Получение всех платежей");
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByStatus(@PathVariable String status) {
        log.info("Получение платежей по статусу: {}", status);
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByContract(@PathVariable UUID contractId) {
        log.info("Получение платежей по контракту: {}", contractId);
        return ResponseEntity.ok(paymentService.getPaymentsByContract(contractId));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsBySupplier(@PathVariable UUID supplierId) {
        log.info("Получение платежей по поставщику: {}", supplierId);
        return ResponseEntity.ok(paymentService.getPaymentsBySupplier(supplierId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentDto> updatePayment(@PathVariable UUID id, @RequestBody PaymentDtoNew paymentDtoNew) {
        log.info("Обновление платежа id {}: {}", id, paymentDtoNew);
        PaymentDto dto = paymentService.updatePayment(id, paymentDtoNew);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID id) {
        log.info("Удаление платежа id {}", id);
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentDto> changePaymentStatus(@PathVariable UUID id, @RequestParam String status) {
        log.info("Изменение статуса платежа id {} на {}", id, status);
        PaymentDto dto = paymentService.changePaymentStatus(id, status);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<PaymentDto> confirmPayment(@PathVariable UUID id) {
        log.info("Подтверждение оплаты платежа id {}", id);
        PaymentDto dto = paymentService.confirmPayment(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping("/contract/{contractId}/debt")
    public ResponseEntity<BigDecimal> getContractDebt(@PathVariable UUID contractId) {
        log.info("Получение задолженности по контракту {}", contractId);
        return ResponseEntity.ok(paymentService.getContractDebt(contractId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<PaymentDto>> getOverduePayments() {
        log.info("Получение просроченных платежей");
        return ResponseEntity.ok(paymentService.getOverduePayments());
    }

    @PostMapping("/from-deliveries")
    public ResponseEntity<List<PaymentDto>> createPaymentsFromDeliveries(@RequestParam UUID contractId) {
        log.info("Создание платежей на основе поставок по контракту {}", contractId);
        return ResponseEntity.ok(paymentService.createPaymentsFromDeliveries(contractId));
    }

    @PostMapping("/from-delivery/{deliveryId}")
    public ResponseEntity<PaymentDto> createPaymentFromDelivery(@PathVariable UUID deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
            .orElseThrow(() -> new EntityNotFoundException("Поставка не найдена"));
        PaymentDto payment = paymentService.createPaymentFromDelivery(delivery);
        if (payment == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/status-stats")
    public ResponseEntity<Map<String, Long>> getStatusStats() {
        return ResponseEntity.ok(paymentService.getStatusStats());
    }

    @GetMapping("/delivery/{deliveryId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByDelivery(@PathVariable UUID deliveryId) {
        log.info("Получение платежей по поставке: {}", deliveryId);
        return ResponseEntity.ok(paymentService.getPaymentsByDelivery(deliveryId));
    }
} 