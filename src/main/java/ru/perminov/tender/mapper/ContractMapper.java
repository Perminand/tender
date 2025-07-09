package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.dto.contract.ContractDtoNew;
import ru.perminov.tender.dto.contract.ContractDtoUpdate;
import ru.perminov.tender.model.Contract;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContractMapper {
    
    /**
     * Преобразовать модель в DTO
     */
    @Mapping(target = "tenderId", source = "tender.id")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "endDate", source = "endDate")
    ContractDto toDto(Contract contract);
    
    /**
     * Преобразовать список моделей в список DTO
     */
    List<ContractDto> toDtoList(List<Contract> contracts);
    
    /**
     * Преобразовать DTO для создания в модель
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tender", ignore = true)
    @Mapping(target = "supplierProposal", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "contractItems", ignore = true)
    Contract toEntity(ContractDtoNew contractDtoNew);
    
    /**
     * Обновить модель из DTO для обновления
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tender", ignore = true)
    @Mapping(target = "supplierProposal", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "contractItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Contract contract, ContractDtoUpdate contractDtoUpdate);
} 