package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.perminov.tender.dto.RequestMaterialDto;
import ru.perminov.tender.model.RequestMaterial;
 
@Mapper(componentModel = "spring", uses = {MaterialMapper.class, UnitMapper.class, CharacteristicMapper.class, WorkTypeMapper.class})
public interface RequestMaterialMapper {
    
    @Mapping(source = "material", target = "material", qualifiedByName = "toMaterialDto")
    @Mapping(source = "unit", target = "unit", qualifiedByName = "toUnitDto")
    @Mapping(source = "size", target = "size")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "deliveryDate", target = "deliveryDate")
    @Mapping(source = "supplierMaterialName", target = "supplierMaterialName")
    @Mapping(source = "estimatePrice", target = "estimatePrice")
    @Mapping(source = "materialLink", target = "materialLink")
    @Mapping(source = "estimateUnit", target = "estimateUnit", qualifiedByName = "toUnitDto")
    @Mapping(source = "estimateQuantity", target = "estimateQuantity")
    RequestMaterialDto toDto(RequestMaterial entity);
    
    @Mapping(source = "material", target = "material")
    @Mapping(source = "unit", target = "unit")
    @Mapping(source = "size", target = "size")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "note", target = "note")
    @Mapping(source = "deliveryDate", target = "deliveryDate")
    @Mapping(source = "supplierMaterialName", target = "supplierMaterialName")
    @Mapping(source = "estimatePrice", target = "estimatePrice")
    @Mapping(source = "materialLink", target = "materialLink")
    @Mapping(source = "estimateUnit", target = "estimateUnit")
    @Mapping(source = "estimateQuantity", target = "estimateQuantity")
    RequestMaterial toEntity(RequestMaterialDto dto);
} 