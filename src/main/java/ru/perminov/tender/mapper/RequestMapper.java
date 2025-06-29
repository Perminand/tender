package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.mapper.company.CompanyMapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CompanyMapper.class, ProjectMapper.class, RequestMaterialMapper.class, WarehouseMapper.class})
public interface RequestMapper {
    
    @Mapping(source = "organization", target = "organization")
    @Mapping(source = "project", target = "project")
    @Mapping(source = "date", target = "date")
    @Mapping(source = "requestNumber", target = "requestNumber")
    @Mapping(source = "materials", target = "materials")
    @Mapping(source = "warehouse", target = "warehouse")
    RequestDto toDto(Request entity);
    
    @Mapping(source = "organization", target = "organization")
    @Mapping(source = "project", target = "project")
    @Mapping(source = "date", target = "date")
    @Mapping(source = "requestNumber", target = "requestNumber")
    @Mapping(source = "materials", target = "materials")
    @Mapping(source = "warehouse", target = "warehouse")
    Request toEntity(RequestDto dto);
} 