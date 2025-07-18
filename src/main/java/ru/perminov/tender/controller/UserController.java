package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.model.User;
import ru.perminov.tender.service.UserService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("Получен GET-запрос: список всех пользователей");
        List<User> users = userService.getAllUsers();
        log.info("Найдено пользователей: {}", users.size());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: пользователь по ID={}", id);
        return userService.getUserById(id)
                .map(user -> {
                    log.info("Найден пользователь: {}", user.getUsername());
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        log.info("Получен GET-запрос: пользователь по username={}", username);
        return userService.getUserByUsername(username)
                .map(user -> {
                    log.info("Найден пользователь: {}", user.getUsername());
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        log.info("Получен GET-запрос: пользователь по email={}", email);
        return userService.getUserByEmail(email)
                .map(user -> {
                    log.info("Найден пользователь: {}", user.getUsername());
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<User>> getUsersByCompany(@PathVariable UUID companyId) {
        log.info("Получен GET-запрос: пользователи компании={}", companyId);
        List<User> users = userService.getUsersByCompany(companyId);
        log.info("Найдено пользователей в компании: {}", users.size());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        log.info("Получен GET-запрос: пользователи с ролью={}", role);
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            List<User> users = userService.getUsersByRole(userRole);
            log.info("Найдено пользователей с ролью {}: {}", role, users.size());
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            log.error("Неизвестная роль: {}", role);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        log.info("Получен POST-запрос: создать пользователя. Данные: {}", user.getUsername());
        try {
            User createdUser = userService.createUser(user);
            log.info("Создан пользователь с id={}", createdUser.getId());
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            log.error("Ошибка при создании пользователя", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody User userDetails) {
        log.info("Получен PUT-запрос: обновить пользователя. id={}, данные: {}", id, userDetails.getUsername());
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            log.info("Обновлен пользователь с id={}", updatedUser.getId());
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("Ошибка при обновлении пользователя", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить пользователя. id={}", id);
        try {
            userService.deleteUser(id);
            log.info("Удален пользователь с id={}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Ошибка при удалении пользователя", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<User> changePassword(
            @PathVariable UUID id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        log.info("Получен POST-запрос: сменить пароль пользователя. id={}", id);
        try {
            User updatedUser = userService.changePassword(id, oldPassword, newPassword);
            log.info("Пароль изменен для пользователя с id={}", updatedUser.getId());
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("Ошибка при смене пароля", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        log.info("Получен PUT-запрос: обновить статус пользователя. id={}, статус={}", id, status);
        try {
            User.UserStatus userStatus = User.UserStatus.valueOf(status.toUpperCase());
            User updatedUser = userService.updateUserStatus(id, userStatus);
            log.info("Статус обновлен для пользователя с id={}", updatedUser.getId());
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            log.error("Неизвестный статус: {}", status);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Ошибка при обновлении статуса", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/assign-company")
    public ResponseEntity<User> assignCompany(
            @PathVariable UUID id,
            @RequestParam UUID companyId) {
        log.info("Получен POST-запрос: назначить компанию пользователю. id={}, companyId={}", id, companyId);
        try {
            User updatedUser = userService.assignCompany(id, companyId);
            log.info("Компания назначена пользователю с id={}", updatedUser.getId());
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("Ошибка при назначении компании", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/company/{companyId}/count")
    public ResponseEntity<Long> countUsersByCompany(@PathVariable UUID companyId) {
        log.info("Получен GET-запрос: количество пользователей компании={}", companyId);
        long count = userService.countUsersByCompany(companyId);
        log.info("Количество пользователей в компании: {}", count);
        return ResponseEntity.ok(count);
    }
} 