package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;
import ru.perminov.tender.dto.OrgSupplierMaterialMappingDto;
import ru.perminov.tender.model.OrgSupplierMaterialMapping;

@Mapper(componentModel = "spring")
public interface OrgSupplierMaterialMappingMapper {

    OrgSupplierMaterialMappingDto toDto(OrgSupplierMaterialMapping entity);

    }
