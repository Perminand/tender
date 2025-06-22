package ru.perminov.tender.dto;

import java.util.UUID;
 
public record UnitDto(
    UUID id,
    String name,
    String shortName
) {} 