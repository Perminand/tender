package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.order.OrderDtoNew;
import ru.perminov.tender.dto.order.OrderDtoUpdate;
import ru.perminov.tender.model.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    Order toOrder(OrderDtoNew orderDtoNew);

    void updateOrderFromDto(OrderDtoUpdate dto, @MappingTarget Order order);
}