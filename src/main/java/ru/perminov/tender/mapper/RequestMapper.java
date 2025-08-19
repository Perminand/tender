package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mapping;
import org.mapstruct.AfterMapping;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.mapper.company.CompanyMapper;

@Mapper(componentModel = "spring", uses = {CompanyMapper.class, ProjectMapper.class, RequestMaterialMapper.class,
        MaterialMapper.class, WorkTypeMapper.class})
public interface RequestMapper {
    
    RequestDto toDto(Request entity);
    
    Request toEntity(RequestDto dto);

    @Mapping(target = "requestMaterials", ignore = true)
    @Mapping(target = "tenders", ignore = true)
    @Mapping(target = "invoices", ignore = true)
    @Mapping(target = "executor", source = "executor")
    void updateRequestFromDto(RequestDto requestDtoForUpdate, @MappingTarget Request request);

} 