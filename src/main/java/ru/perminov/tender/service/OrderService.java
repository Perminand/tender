package ru.perminov.tender.service;

import ru.perminov.tender.dto.OrderDtoNew;
import ru.perminov.tender.dto.OrderDtoUpdate;
import ru.perminov.tender.model.Order;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    Order create(OrderDtoNew orderDtoNew);

    Order update(UUID id, OrderDtoUpdate order);

    void delete(UUID id);

    Order getById(UUID id);

    List<Order> getAll();

}