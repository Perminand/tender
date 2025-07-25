package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ContactTypeDtoNew(

    @NotBlank(message = "Название типа контакта не может быть пустым")
    String name
) {} 