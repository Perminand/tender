package ru.perminov.tender.service;

import ru.perminov.tender.dto.company.BankAccountDto;
 
public interface BankService {
    BankAccountDto getBankDetailsByBik(String bik);
} 