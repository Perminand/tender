package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.PaymentConditionDto;
import ru.perminov.tender.service.PaymentConditionService;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payment-conditions")
@RequiredArgsConstructor
public class PaymentConditionController {

    private final PaymentConditionService paymentConditionService;

    @PostMapping
    public ResponseEntity<PaymentConditionDto> createPaymentCondition(@Valid @RequestBody PaymentConditionDto paymentConditionDto) {
        log.info("Получен POST-запрос: создать условия оплаты. Данные: {}", paymentConditionDto);
        return ResponseEntity.ok(paymentConditionService.createPaymentCondition(paymentConditionDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentConditionDto> updatePaymentCondition(@PathVariable UUID id, @Valid @RequestBody PaymentConditionDto paymentConditionDto) {
        log.info("Получен PUT-запрос: обновить условия оплаты. id={}, данные: {}", id, paymentConditionDto);
        return ResponseEntity.ok(paymentConditionService.updatePaymentCondition(id, paymentConditionDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentConditionDto> getPaymentCondition(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить условия оплаты. id={}", id);
        return ResponseEntity.ok(paymentConditionService.getPaymentCondition(id));
    }

    @GetMapping
    public ResponseEntity<List<PaymentConditionDto>> getAllPaymentConditions() {
        log.info("Получен GET-запрос: получить все условия оплаты");
        return ResponseEntity.ok(paymentConditionService.getAllPaymentConditions());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentCondition(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить условия оплаты. id={}", id);
        paymentConditionService.deletePaymentCondition(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/default")
    public ResponseEntity<PaymentConditionDto> createDefaultPaymentCondition(@RequestParam String name, @RequestParam(required = false) String description) {
        log.info("Получен POST-запрос: создать стандартные условия оплаты. name={}, description={}", name, description);
        return ResponseEntity.ok(paymentConditionService.createDefaultPaymentCondition(name, description));
    }
}
