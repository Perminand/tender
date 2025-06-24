package ru.perminov.tender.service;

import ru.perminov.tender.dto.worktype.WorkTypeDto;
import java.util.List;
import java.util.UUID;

public interface WorkTypeService {
    List<WorkTypeDto> getAllWorkTypes();
    WorkTypeDto createWorkType(WorkTypeDto workTypeDto);
} 