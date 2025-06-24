package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.mapper.company.CompanyMapper;

@Mapper(componentModel = "spring", uses = {CompanyMapper.class, ProjectMapper.class, RequestMaterialMapper.class})
public interface RequestMapper {
    RequestDto toDto(Request entity);
    Request toEntity(RequestDto dto);
} 