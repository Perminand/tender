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
        log.info("Получен POST-запрос: создать заявку. Данные: {}", orderDtoNew);
        Order created = orderService.create(orderDtoNew);
        log.info("Создана заявка с id={}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> update(@PathVariable UUID id, @RequestBody OrderDtoUpdate orderDtoUpdate) {
        log.info("Получен PUT-запрос: обновить заявку. id={}, данные: {}", id, orderDtoUpdate);
        Order updated = orderService.update(id, orderDtoUpdate);
        log.info("Обновлена заявка с id={}", updated.getId());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить заявку по id={}", id);
        Order order = orderService.getById(id);
        log.info("Найдена заявка: {}", order);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAll() {
        log.info("Получен GET-запрос: получить все заявки");
        List<Order> orders = orderService.getAll();
        log.info("Возвращено заявок: {}", orders.size());
        return ResponseEntity.ok(orders);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить заявку. id={}", id);
        orderService.delete(id);
        log.info("Удалена заявка с id={}", id);
        return ResponseEntity.ok().build();
    }
} 