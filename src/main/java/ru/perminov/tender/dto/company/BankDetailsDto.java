package ru.perminov.tender.dto.company;

import jakarta.validation.constraints.Pattern;

public record BankDetailsDto(
    String bankName,
    @Pattern(regexp = "^\\d{9}$", message = "БИК должен содержать 9 цифр")
    String bik,
    String checkingAccount,
    String correspondentAccount
) {
} 