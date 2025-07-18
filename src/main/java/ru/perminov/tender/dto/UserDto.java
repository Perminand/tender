package ru.perminov.tender.dto;

import lombok.Data;
import java.util.Set;
import java.util.UUID;

@Data
public class UserDto {
    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String middleName;
    private String phone;
    private String status;
    private Set<String> roles;
    private Boolean isEnabled;
    private Boolean isAccountNonLocked;
    private String companyName;
    private UUID companyId;
} 