package ru.perminov.tender.dto.dictionary;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CountryDto {
    private UUID id;
    private String name;
    private String code;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 