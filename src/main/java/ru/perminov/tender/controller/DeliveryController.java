package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.StatusChangeRequest;
import ru.perminov.tender.dto.delivery.DeliveryDto;
import ru.perminov.tender.dto.delivery.DeliveryDtoNew;
import ru.perminov.tender.dto.delivery.DeliveryItemDto;
import ru.perminov.tender.service.DeliveryService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@Slf4j
public class DeliveryController {
    private final DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<DeliveryDto> createDelivery(@RequestBody DeliveryDtoNew deliveryDtoNew) {
        log.info("Создание поставки: {}", deliveryDtoNew);
        return ResponseEntity.ok(deliveryService.createDelivery(deliveryDtoNew));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDto> getDeliveryById(@PathVariable UUID id) {
        log.info("Получение поставки по id: {}", id);
        DeliveryDto dto = deliveryService.getDeliveryById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<Page<DeliveryDto>> getAllDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String contractId,
            @RequestParam(required = false) String supplierId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        log.info("Получение поставок с фильтрами: page={}, size={}, status={}, contractId={}, supplierId={}, dateFrom={}, dateTo={}", 
                page, size, status, contractId, supplierId, dateFrom, dateTo);
        return ResponseEntity.ok(deliveryService.getDeliveriesWithFilters(page, size, status, contractId, supplierId, dateFrom, dateTo));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DeliveryDto>> getDeliveriesByStatus(@PathVariable String status) {
        log.info("Получение поставок по статусу: {}", status);
        return ResponseEntity.ok(deliveryService.getDeliveriesByStatus(status));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<DeliveryDto>> getDeliveriesByContract(@PathVariable UUID contractId) {
        log.info("Получение поставок по контракту: {}", contractId);
        return ResponseEntity.ok(deliveryService.getDeliveriesByContract(contractId));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<DeliveryDto>> getDeliveriesBySupplier(@PathVariable UUID supplierId) {
        log.info("Получение поставок по поставщику: {}", supplierId);
        return ResponseEntity.ok(deliveryService.getDeliveriesBySupplier(supplierId));
    }

    @GetMapping("/status-stats")
    public ResponseEntity<Map<String, Long>> getStatusStats() {
        return ResponseEntity.ok(deliveryService.getStatusStats());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryDto> updateDelivery(@PathVariable UUID id, @RequestBody DeliveryDtoNew deliveryDtoNew) {
        log.info("Обновление поставки id {}: {}", id, deliveryDtoNew);
        DeliveryDto dto = deliveryService.updateDelivery(id, deliveryDtoNew);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable UUID id) {
        log.info("Удаление поставки id {}", id);
        deliveryService.deleteDelivery(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DeliveryDto> changeDeliveryStatus(@PathVariable UUID id, @RequestBody StatusChangeRequest request) {
        log.info("Изменение статуса поставки id {} на {} с комментарием: {}", id, request.getStatus(), request.getComment());
        DeliveryDto dto = deliveryService.changeDeliveryStatus(id, request.getStatus(), request.getComment());
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<DeliveryItemDto>> getDeliveryItems(@PathVariable UUID id) {
        log.info("Получение позиций поставки id {}", id);
        return ResponseEntity.ok(deliveryService.getDeliveryItems(id));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<DeliveryDto> confirmDelivery(@PathVariable UUID id) {
        log.info("Подтверждение приемки поставки id {}", id);
        DeliveryDto dto = deliveryService.confirmDelivery(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<DeliveryDto> rejectDelivery(@PathVariable UUID id, @RequestParam String reason) {
        log.info("Отклонение поставки id {}: {}", id, reason);
        DeliveryDto dto = deliveryService.rejectDelivery(id, reason);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{deliveryId}/items/{itemId}/acceptance")
    public ResponseEntity<DeliveryItemDto> updateDeliveryItemAcceptance(
            @PathVariable UUID deliveryId,
            @PathVariable UUID itemId,
            @RequestBody DeliveryItemDto acceptanceDto) {
        log.info("Обновление приемки позиции поставки: deliveryId={}, itemId={}", deliveryId, itemId);
        DeliveryItemDto dto = deliveryService.updateDeliveryItemAcceptance(deliveryId, itemId, acceptanceDto);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }
} 