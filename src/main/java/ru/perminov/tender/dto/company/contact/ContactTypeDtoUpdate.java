package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ContactTypeDtoUpdate(
    @NotBlank(message = "Код типа контакта не может быть пустым")
    @Pattern(regexp = "^[A-Z_]+$", message = "Код должен содержать только заглавные буквы и подчеркивания")
    String code,

    @NotBlank(message = "Название типа контакта не может быть пустым")
    String name
) {} 