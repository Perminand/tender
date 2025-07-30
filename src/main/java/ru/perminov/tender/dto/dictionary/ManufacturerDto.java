package ru.perminov.tender.dto.dictionary;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ManufacturerDto {
    private UUID id;
    private String name;
    private String country;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 