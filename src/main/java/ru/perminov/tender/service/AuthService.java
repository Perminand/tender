package ru.perminov.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.auth.LoginRequest;
import ru.perminov.tender.dto.auth.LoginResponse;
import ru.perminov.tender.dto.auth.RegisterRequest;
import ru.perminov.tender.dto.auth.RefreshTokenRequest;
import ru.perminov.tender.model.User;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.UserRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.AuditLogService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Попытка входа пользователя: {}", request.username());
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Обновляем время последнего входа
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        long expiresIn = 86400000L; // 24 hours

        log.info("Успешный вход пользователя: {}", request.username());
        auditLogService.logSimple(user, "LOGIN", "User", user.getId().toString(), "Пользователь вошел в систему");
        return LoginResponse.fromUser(user, jwtToken, refreshToken, expiresIn);
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        log.info("Попытка регистрации пользователя: {}", request.username());
        
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setMiddleName(request.middleName());
        user.setPhone(request.phone());

        // Устанавливаем компанию если указана
        if (request.companyId() != null) {
            Company company = companyRepository.findById(request.companyId())
                    .orElseThrow(() -> new RuntimeException("Компания не найдена"));
            user.setCompany(company);
        }

        // Устанавливаем роли
        Set<User.UserRole> roles = new HashSet<>();
        if (request.roles() != null && !request.roles().isEmpty()) {
            for (String roleStr : request.roles()) {
                try {
                    roles.add(User.UserRole.valueOf(roleStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    log.warn("Неизвестная роль: {}", roleStr);
                }
            }
        } else {
            // По умолчанию роль VIEWER
            roles.add(User.UserRole.VIEWER);
        }
        user.setRoles(roles);

        user = userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        long expiresIn = 86400000L; // 24 hours

        log.info("Пользователь успешно зарегистрирован: {}", request.username());
        
        return LoginResponse.fromUser(user, jwtToken, refreshToken, expiresIn);
    }

    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        log.info("Обновление токена");
        
        try {
            String username = jwtService.extractUsername(request.refreshToken());
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

            if (jwtService.validateToken(request.refreshToken())) {
                String jwtToken = jwtService.generateToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);
                long expiresIn = 86400000L; // 24 hours

                log.info("Токен успешно обновлен для пользователя: {}", username);
                
                return LoginResponse.fromUser(user, jwtToken, refreshToken, expiresIn);
            } else {
                throw new RuntimeException("Недействительный refresh токен");
            }
        } catch (Exception e) {
            log.error("Ошибка при обновлении токена", e);
            throw new RuntimeException("Ошибка при обновлении токена");
        }
    }

    public void logout(UUID userId) {
        log.info("Выход пользователя");
        // В stateless архитектуре logout обычно обрабатывается на клиенте
        // Здесь можно добавить логику для blacklist токенов если необходимо
        auditLogService.logSimple(getCurrentUser(), "LOGOUT", "User", userId.toString(), "Пользователь вышел из системы");
    }

    @Transactional
    public User changePassword(UUID userId, String oldPassword, String newPassword) {
        log.info("Попытка изменения пароля для пользователя: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Старый пароль неверный");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        User updatedUser = userRepository.save(user);

        log.info("Пароль успешно изменен для пользователя: {}", updatedUser.getUsername());
        auditLogService.logSimple(user, "CHANGE_PASSWORD", "User", updatedUser.getId().toString(), "Смена пароля");
        return updatedUser;
    }

    @Transactional
    public Map<String, Object> getUserPermissions(String username) {
        log.info("Получение разрешений для пользователя: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        Map<String, Object> permissions = new HashMap<>();
        
        // Добавляем роли пользователя
        Set<String> roles = user.getRoles().stream()
                .map(role -> "ROLE_" + role.name())
                .collect(Collectors.toSet());
        permissions.put("roles", roles);
        
        // Добавляем разрешения на основе ролей
        Set<String> permissionsList = new HashSet<>();
        
        if (roles.contains("ROLE_ADMIN")) {
            permissionsList.addAll(Arrays.asList(
                "dashboard:read", "dashboard:write",
                "requests:read", "requests:write", "requests:delete",
                "tenders:read", "tenders:write", "tenders:delete",
                "contracts:read", "contracts:write", "contracts:delete",
                "deliveries:read", "deliveries:write", "deliveries:delete",
                "payments:read", "payments:write", "payments:delete",
                "documents:read", "documents:write", "documents:delete",
                "notifications:read", "notifications:write",
                "alerts:read", "alerts:write",
                "companies:read", "companies:write", "companies:delete",
                "materials:read", "materials:write", "materials:delete",
                "projects:read", "projects:write", "projects:delete",
                "settings:read", "settings:write",
                "users:read", "users:write", "users:delete"
            ));
        } else if (roles.contains("ROLE_MANAGER")) {
            permissionsList.addAll(Arrays.asList(
                "dashboard:read", "dashboard:write",
                "requests:read", "requests:write",
                "tenders:read", "tenders:write",
                "contracts:read", "contracts:write",
                "deliveries:read", "deliveries:write",
                "payments:read", "payments:write",
                "documents:read", "documents:write",
                "notifications:read", "notifications:write",
                "alerts:read", "alerts:write",
                "companies:read", "companies:write",
                "materials:read", "materials:write",
                "projects:read", "projects:write"
            ));
        } else if (roles.contains("ROLE_CUSTOMER")) {
            permissionsList.addAll(Arrays.asList(
                "dashboard:read",
                "requests:read", "requests:write",
                "alerts:read",
                "companies:read",
                "materials:read",
                "projects:read"
            ));
        } else if (roles.contains("ROLE_SUPPLIER")) {
            permissionsList.addAll(Arrays.asList(
                "tenders:read",
                "proposals:read", "proposals:write",
                "notifications:read"
            ));
        } else if (roles.contains("ROLE_VIEWER")) {
            permissionsList.addAll(Arrays.asList(
                "dashboard:read",
                "requests:read",
                "tenders:read",
                "contracts:read",
                "deliveries:read",
                "payments:read",
                "documents:read",
                "notifications:read",
                "alerts:read",
                "companies:read",
                "materials:read",
                "projects:read"
            ));
        }
        
        permissions.put("permissions", permissionsList);
        permissions.put("username", username);
        permissions.put("companyId", user.getCompany() != null ? user.getCompany().getId().toString() : null);
        
        log.info("Разрешения для пользователя {}: {}", username, permissions);
        return permissions;
    }
} 