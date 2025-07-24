package ru.perminov.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.model.User;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.UserRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.dto.UserDto;
import ru.perminov.tender.service.AuditLogService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    public List<UserDto> getAllUsers() {
        log.info("Получение списка всех пользователей");
        return userRepository.findAll().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setMiddleName(user.getMiddleName());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        dto.setRoles(user.getRoles() != null ? user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet()) : null);
        dto.setIsEnabled(user.getIsEnabled());
        dto.setIsAccountNonLocked(user.getIsAccountNonLocked());
        if (user.getCompany() != null) {
            dto.setCompanyName(user.getCompany().getName());
            dto.setCompanyId(user.getCompany().getId());
        }
        return dto;
    }

    public Optional<User> getUserById(UUID id) {
        log.info("Получение пользователя по ID: {}", id);
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        log.info("Получение пользователя по username: {}", username);
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        log.info("Получение пользователя по email: {}", email);
        return userRepository.findByEmail(email);
    }

    public List<User> getUsersByCompany(UUID companyId) {
        log.info("Получение пользователей компании: {}", companyId);
        return userRepository.findByCompanyId(companyId);
    }

    public List<User> getUsersByRole(User.UserRole role) {
        log.info("Получение пользователей с ролью: {}", role);
        return userRepository.findByRole(role);
    }

    @Transactional
    public User createUser(User user) {
        log.info("Создание нового пользователя: {}", user.getUsername());
        
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        // Кодируем пароль если он не закодирован
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("Пользователь успешно создан: {}", savedUser.getUsername());
        auditLogService.logSimple(getCurrentUser(), "CREATE_USER", "User", savedUser.getId().toString(), "Создан пользователь");
        
        return savedUser;
    }

    @Transactional
    public User updateUser(UUID id, User userDetails) {
        log.info("Обновление пользователя: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Проверяем уникальность username и email
        if (!user.getUsername().equals(userDetails.getUsername()) && 
            userRepository.existsByUsername(userDetails.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        // Обновляем поля
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setMiddleName(userDetails.getMiddleName());
        user.setPhone(userDetails.getPhone());
        user.setStatus(userDetails.getStatus());
        user.setCompany(userDetails.getCompany());
        user.setRoles(userDetails.getRoles());
        user.setIsEnabled(userDetails.getIsEnabled());
        user.setIsAccountNonExpired(userDetails.getIsAccountNonExpired());
        user.setIsAccountNonLocked(userDetails.getIsAccountNonLocked());
        user.setIsCredentialsNonExpired(userDetails.getIsCredentialsNonExpired());

        // Обновляем пароль только если он изменился
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        log.info("Пользователь успешно обновлен: {}", updatedUser.getUsername());
        auditLogService.logSimple(getCurrentUser(), "UPDATE_USER", "User", updatedUser.getId().toString(), "Обновлен пользователь");
        
        return updatedUser;
    }

    @Transactional
    public void deleteUser(UUID id) {
        log.info("Удаление пользователя: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        userRepository.delete(user);
        log.info("Пользователь успешно удален: {}", user.getUsername());
        auditLogService.logSimple(getCurrentUser(), "DELETE_USER", "User", user.getId().toString(), "Удален пользователь");
    }

    @Transactional
    public User changePassword(UUID userId, String oldPassword, String newPassword) {
        log.info("Смена пароля пользователя: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Проверяем старый пароль
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Неверный старый пароль");
        }

        // Устанавливаем новый пароль
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        log.info("Пароль успешно изменен для пользователя: {}", updatedUser.getUsername());
        
        return updatedUser;
    }

    @Transactional
    public User updateUserStatus(UUID userId, User.UserStatus status) {
        log.info("Обновление статуса пользователя: {} на {}", userId, status);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        log.info("Статус пользователя успешно обновлен: {}", updatedUser.getUsername());
        
        return updatedUser;
    }

    @Transactional
    public User assignCompany(UUID userId, UUID companyId) {
        log.info("Назначение компании пользователю: {} -> {}", userId, companyId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Компания не найдена"));
        
        user.setCompany(company);
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        log.info("Компания успешно назначена пользователю: {}", updatedUser.getUsername());
        
        return updatedUser;
    }

    public long countUsersByCompany(UUID companyId) {
        log.info("Подсчет пользователей компании: {}", companyId);
        return userRepository.countByCompanyId(companyId);
    }
} 