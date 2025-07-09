package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.payment.PaymentDto;
import ru.perminov.tender.dto.payment.PaymentDtoNew;
import ru.perminov.tender.model.Payment;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    
    /**
     * Преобразовать модель в DTO
     */
    @Mapping(target = "contractId", source = "contract.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "paymentType", source = "type")
    @Mapping(target = "dueDate", source = "dueDate")
    @Mapping(target = "paidDate", source = "paidDate")
    @Mapping(target = "notes", source = "notes")
    PaymentDto toDto(Payment payment);
    
    /**
     * Преобразовать список моделей в список DTO
     */
    List<PaymentDto> toDtoList(List<Payment> payments);
    
    /**
     * Преобразовать DTO для создания в модель
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paidDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "type", source = "paymentType")
    Payment toEntity(PaymentDtoNew paymentDtoNew);
    
    /**
     * Обновить модель из DTO для создания
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paidDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "type", source = "paymentType")
    void updateEntity(@MappingTarget Payment payment, PaymentDtoNew paymentDtoNew);
} 