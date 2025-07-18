package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.auth.LoginRequest;
import ru.perminov.tender.dto.auth.LoginResponse;
import ru.perminov.tender.dto.auth.RegisterRequest;
import ru.perminov.tender.dto.auth.RefreshTokenRequest;
import ru.perminov.tender.service.AuthService;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Получен POST-запрос: вход в систему. Пользователь: {}", request.username());
        try {
            LoginResponse response = authService.login(request);
            log.info("Успешный вход пользователя: {}", request.username());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Ошибка при входе пользователя: {}", request.username(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Получен POST-запрос: регистрация пользователя. Пользователь: {}", request.username());
        try {
            LoginResponse response = authService.register(request);
            log.info("Успешная регистрация пользователя: {}", request.username());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Ошибка при регистрации пользователя: {}", request.username(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Получен POST-запрос: обновление токена");
        try {
            LoginResponse response = authService.refreshToken(request);
            log.info("Токен успешно обновлен");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Ошибка при обновлении токена", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        log.info("Получен POST-запрос: выход из системы");
        try {
            authService.logout(token);
            log.info("Успешный выход из системы");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Ошибка при выходе из системы", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(@RequestHeader("Authorization") String token) {
        log.info("Получен GET-запрос: информация о текущем пользователе");
        // Здесь можно добавить логику для получения информации о текущем пользователе
        return ResponseEntity.ok().build();
    }
} 