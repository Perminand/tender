package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import ru.perminov.tender.dto.OrderDtoNew;
import ru.perminov.tender.model.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    Order toOrder(OrderDtoNew orderDtoNew);
}
