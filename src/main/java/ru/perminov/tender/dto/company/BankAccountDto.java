package ru.perminov.tender.dto.company;

import lombok.Data;

@Data
public class BankAccountDto {
    private String bankName;
    private String bik;
    private String checkingAccount;
    private String correspondentAccount;
} 