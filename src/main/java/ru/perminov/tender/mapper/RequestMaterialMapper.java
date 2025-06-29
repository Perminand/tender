package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.RequestMaterialDto;
import ru.perminov.tender.model.RequestMaterial;
 
@Mapper(componentModel = "spring", uses = {MaterialMapper.class, UnitMapper.class})
public interface RequestMaterialMapper {
    
    @Mapping(source = "material", target = "material", qualifiedByName = "toMaterialDto")
    @Mapping(source = "unit", target = "unit", qualifiedByName = "toUnitDto")
    @Mapping(source = "section", target = "section")
    @Mapping(source = "workType", target = "workType")
    @Mapping(source = "size", target = "size")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "deliveryDate", target = "deliveryDate")
    @Mapping(source = "supplierMaterialName", target = "supplierMaterialName")
    RequestMaterialDto toDto(RequestMaterial entity);
    
    @Mapping(source = "material", target = "material")
    @Mapping(source = "unit", target = "unit")
    @Mapping(source = "section", target = "section")
    @Mapping(source = "workType", target = "workType")
    @Mapping(source = "size", target = "size")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "deliveryDate", target = "deliveryDate")
    @Mapping(source = "supplierMaterialName", target = "supplierMaterialName")
    RequestMaterial toEntity(RequestMaterialDto dto);
} 