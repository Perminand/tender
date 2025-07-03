package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;
import ru.perminov.tender.dto.worktype.WorkTypeDto;
import ru.perminov.tender.model.WorkType;

@Mapper(componentModel = "spring")
public interface WorkTypeMapper {

    WorkTypeDto toDto(WorkType workType);

    WorkType toEntity(WorkTypeDto dto);
} 