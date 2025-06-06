package ru.perminov.tender.dto.company.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record ContactPersonDtoUpdate(

    String lastName,

    String firstName,
    
    String position,

    @Pattern(regexp = "^\\+?[1-9]\\d{10,14}$", message = "Неверный формат телефона")
    String phone,

    @Email(message = "Неверный формат email")
    String email
) {} 