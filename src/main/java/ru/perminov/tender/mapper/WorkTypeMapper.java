package ru.perminov.tender.mapper;

import org.springframework.stereotype.Component;
import ru.perminov.tender.dto.worktype.WorkTypeDto;
import ru.perminov.tender.model.WorkType;

@Component
public class WorkTypeMapper {
    public WorkTypeDto toDto(WorkType workType) {
        WorkTypeDto dto = new WorkTypeDto();
        dto.setId(workType.getId());
        dto.setName(workType.getName());
        return dto;
    }

    public WorkType toEntity(WorkTypeDto dto) {
        WorkType workType = new WorkType();
        workType.setId(dto.getId());
        workType.setName(dto.getName());
        return workType;
    }
} 