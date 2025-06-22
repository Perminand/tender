package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.perminov.tender.dto.company.BankAccountDto;
import ru.perminov.tender.service.BankService;

@RestController
@RequestMapping("/api/banks")
@RequiredArgsConstructor
public class BankController {

    private final BankService bankService;

    @GetMapping("/bik/{bik}")
    public ResponseEntity<BankAccountDto> getBankDetailsByBik(@PathVariable String bik) {
        BankAccountDto bankDetails = bankService.getBankDetailsByBik(bik);
        if (bankDetails == null || bankDetails.getBankName() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bankDetails);
    }
} 