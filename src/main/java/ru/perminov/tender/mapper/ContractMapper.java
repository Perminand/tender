package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.dto.contract.ContractDtoNew;
import ru.perminov.tender.dto.contract.ContractDtoUpdate;
import ru.perminov.tender.model.Contract;
import org.mapstruct.factory.Mappers;
import ru.perminov.tender.mapper.company.CompanyMapper;
import ru.perminov.tender.mapper.TenderMapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {CompanyMapper.class, TenderMapper.class})
public interface ContractMapper {
    
    /**
     * Преобразовать модель в DTO
     */
    @Mapping(target = "tenderId", source = "tender.id")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "endDate", source = "endDate")
    @Mapping(target = "contractItems", ignore = true)
    @Mapping(target = "tender", source = "tender")
    @Mapping(target = "supplierId", source = "supplierProposal.supplier.id")
    @Mapping(target = "supplierName", source = "supplierProposal.supplier.name")
    @Mapping(target = "customerId", source = "supplierProposal.tender.customer.id")
    @Mapping(target = "customerName", source = "supplierProposal.tender.customer.name")
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
    @Mapping(target = "contractItems", ignore = true)
    Contract toEntity(ContractDtoNew contractDtoNew);
    
    /**
     * Обновить модель из DTO для обновления
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tender", ignore = true)
    @Mapping(target = "supplierProposal", ignore = true)
    @Mapping(target = "contractItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Contract contract, ContractDtoUpdate contractDtoUpdate);
} 