package ru.perminov.tender.dto.companyType;

import jakarta.validation.constraints.NotBlank;
 
public record CompanyTypeDtoNew(
    @NotBlank(message = "Название типа компании не может быть пустым")
    String name
    
) {}