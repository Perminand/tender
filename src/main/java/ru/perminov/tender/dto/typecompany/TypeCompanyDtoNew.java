package ru.perminov.tender.dto.typecompany;

import jakarta.validation.constraints.NotBlank;
 
public record TypeCompanyDtoNew(
    @NotBlank(message = "Название типа компании не может быть пустым")
    String name,
    
    @NotBlank(message = "Код типа компании не может быть пустым")
    String code
) {} 