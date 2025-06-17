package ru.perminov.tender.dto.companyType;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CompanyTypeDto(

         UUID id,

        String name
    
) {}