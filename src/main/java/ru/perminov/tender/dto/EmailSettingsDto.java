package ru.perminov.tender.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailSettingsDto(
    @NotBlank(message = "SMTP хост обязателен")
    String smtpHost,
    
    @NotBlank(message = "SMTP порт обязателен")
    String smtpPort,
    
    @NotBlank(message = "Email пользователя обязателен")
    @Email(message = "Некорректный формат email")
    String username,
    
    @NotBlank(message = "Пароль обязателен")
    String password,
    
    @NotBlank(message = "Email отправителя обязателен")
    @Email(message = "Некорректный формат email")
    String fromEmail,
    
    String fromName,
    
    Boolean enabled,
    
    Boolean useSsl,
    
    Boolean useTls
) {} 