package ru.perminov.tender.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;
import java.util.UUID;

public record RegisterRequest(
    @NotBlank(message = "Имя пользователя обязательно")
    @Size(min = 3, max = 50, message = "Имя пользователя должно быть от 3 до 50 символов")
    String username,
    
    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный формат email")
    String email,
    
    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, message = "Пароль должен содержать минимум 6 символов")
    String password,
    
    @NotBlank(message = "Имя обязательно")
    String firstName,
    
    String lastName,
    
    String middleName,
    
    String phone,
    
    UUID companyId,
    
    Set<String> roles
) {} 