package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.order.OrderDtoNew;
import ru.perminov.tender.dto.order.OrderDtoUpdate;
import ru.perminov.tender.model.Order;
import ru.perminov.tender.service.OrderService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody @Valid OrderDtoNew orderDtoNew) {
        log.info("Пришел POST запрос на создание заявки: {}", orderDtoNew);
        return ResponseEntity.ok(orderService.create(orderDtoNew));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Order> update(@PathVariable UUID id, @RequestBody OrderDtoUpdate orderDtoUpdate) {
        log.info("Пришел PATCH запрос на изменение заявки uuid: {} содержимое: {}", id, orderDtoUpdate);
        return ResponseEntity.ok(orderService.update(id, orderDtoUpdate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable UUID id) {
        log.info("Пришел запрос на получение заявки с id: {}", id);
        return ResponseEntity.ok(orderService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAll() {
        log.info("Пришел запрос на получение всех заявок");
        return ResponseEntity.ok(orderService.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Пришел запрос на удаление заявки с id: {}", id);
        orderService.delete(id);
        return ResponseEntity.ok().build();
    }
} 