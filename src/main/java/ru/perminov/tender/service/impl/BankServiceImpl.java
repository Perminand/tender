package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ru.perminov.tender.dto.HtmlWebBankResponseDto;
import ru.perminov.tender.dto.company.BankAccountDto;
import ru.perminov.tender.service.BankService;

@Service
@RequiredArgsConstructor
public class BankServiceImpl implements BankService {

    private final RestTemplate restTemplate;
    private static final String BANK_API_URL = "https://htmlweb.ru/json/service/bic/";

    @Override
    public BankAccountDto getBankDetailsByBik(String bik) {
        String url = BANK_API_URL + bik;
        HtmlWebBankResponseDto response = restTemplate.getForObject(url, HtmlWebBankResponseDto.class);

        if (response != null) {
            BankAccountDto dto = new BankAccountDto();
            dto.setBankName(response.getName());
            dto.setBik(bik);
            dto.setCorrespondentAccount(response.getCorrespondentAccount());
            return dto;
        }
        // Consider throwing a custom exception for better error handling
        return null;
    }
} 