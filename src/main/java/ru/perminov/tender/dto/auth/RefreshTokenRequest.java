package ru.perminov.tender.dto.auth;

import jakarta.validation.constraints.NotBlank;
 
public record RefreshTokenRequest(
    @NotBlank(message = "Refresh токен обязателен")
    String refreshToken
) {} 