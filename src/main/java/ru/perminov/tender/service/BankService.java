package ru.perminov.tender.service;

import ru.perminov.tender.dto.company.BankDetailsDto;

public interface BankService {
    BankDetailsDto getBankDetailsByBik(String bik);
} 