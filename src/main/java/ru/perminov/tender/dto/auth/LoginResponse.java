package ru.perminov.tender.dto.auth;

import ru.perminov.tender.model.User;

import java.util.Set;
import java.util.UUID;

public record LoginResponse(
    String token,
    String refreshToken,
    String tokenType,
    Long expiresIn,
    UUID userId,
    String username,
    String email,
    String firstName,
    String lastName,
    String companyName,
    UUID companyId,
    Set<String> roles
) {
    public static LoginResponse fromUser(User user, String token, String refreshToken, Long expiresIn) {
        return new LoginResponse(
            token,
            refreshToken,
            "Bearer",
            expiresIn,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getCompany() != null ? user.getCompany().getName() : null,
            user.getCompany() != null ? user.getCompany().getId() : null,
            user.getRoles().stream()
                .map(role -> "ROLE_" + role.name())
                .collect(java.util.stream.Collectors.toSet())
        );
    }
} 