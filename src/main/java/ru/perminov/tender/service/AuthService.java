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

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

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

    public void logout(String token) {
        log.info("Выход пользователя");
        // В stateless архитектуре logout обычно обрабатывается на клиенте
        // Здесь можно добавить логику для blacklist токенов если необходимо
    }
} 