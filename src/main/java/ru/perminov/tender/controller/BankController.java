package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import ru.perminov.tender.dto.company.BankAccountDto;
import ru.perminov.tender.service.BankService;

@RestController
@RequestMapping("/api/banks")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
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