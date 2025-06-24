package ru.perminov.tender.dto.worktype;

import lombok.Data;
import java.util.UUID;

@Data
public class WorkTypeDto {
    private UUID id;
    private String name;
} 