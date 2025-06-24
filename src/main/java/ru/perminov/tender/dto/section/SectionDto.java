package ru.perminov.tender.dto.section;

import lombok.Data;
import java.util.UUID;

@Data
public class SectionDto {
    private UUID id;
    private String name;
    private UUID projectId;
} 