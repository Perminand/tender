package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.DeliveryConditionDto;
import ru.perminov.tender.service.DeliveryConditionService;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/delivery-conditions")
@RequiredArgsConstructor
public class DeliveryConditionController {

    private final DeliveryConditionService deliveryConditionService;

    @PostMapping
    public ResponseEntity<DeliveryConditionDto> createDeliveryCondition(@Valid @RequestBody DeliveryConditionDto deliveryConditionDto) {
        log.info("Получен POST-запрос: создать условия доставки. Данные: {}", deliveryConditionDto);
        return ResponseEntity.ok(deliveryConditionService.createDeliveryCondition(deliveryConditionDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryConditionDto> updateDeliveryCondition(@PathVariable UUID id, @Valid @RequestBody DeliveryConditionDto deliveryConditionDto) {
        log.info("Получен PUT-запрос: обновить условия доставки. id={}, данные: {}", id, deliveryConditionDto);
        return ResponseEntity.ok(deliveryConditionService.updateDeliveryCondition(id, deliveryConditionDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryConditionDto> getDeliveryCondition(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить условия доставки. id={}", id);
        return ResponseEntity.ok(deliveryConditionService.getDeliveryCondition(id));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryConditionDto>> getAllDeliveryConditions() {
        log.info("Получен GET-запрос: получить все условия доставки");
        return ResponseEntity.ok(deliveryConditionService.getAllDeliveryConditions());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliveryCondition(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить условия доставки. id={}", id);
        deliveryConditionService.deleteDeliveryCondition(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/default")
    public ResponseEntity<DeliveryConditionDto> createDefaultDeliveryCondition(@RequestParam String name, @RequestParam(required = false) String description) {
        log.info("Получен POST-запрос: создать стандартные условия доставки. name={}, description={}", name, description);
        return ResponseEntity.ok(deliveryConditionService.createDefaultDeliveryCondition(name, description));
    }
}
