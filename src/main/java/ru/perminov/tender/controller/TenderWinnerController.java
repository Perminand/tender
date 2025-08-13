package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.*;
import ru.perminov.tender.service.TenderWinnerService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenders")
@RequiredArgsConstructor
@Slf4j
public class TenderWinnerController {

    private final TenderWinnerService tenderWinnerService;

    @GetMapping("/{tenderId}/winners")
    public ResponseEntity<TenderWinnerDto> getTenderWinners(@PathVariable UUID tenderId) {
        log.info("Получен запрос на определение победителей для тендера: {}", tenderId);
        
        try {
            TenderWinnerDto winners = tenderWinnerService.determineWinners(tenderId);
            return ResponseEntity.ok(winners);
        } catch (Exception e) {
            log.error("Ошибка при определении победителей для тендера {}: {}", tenderId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{tenderId}/winners/items/{itemId}")
    public ResponseEntity<TenderItemWinnerDto> getItemWinner(
            @PathVariable UUID tenderId,
            @PathVariable UUID itemId) {
        log.info("Получен запрос на победителя позиции {} тендера {}", itemId, tenderId);
        
        try {
            TenderItemWinnerDto winner = tenderWinnerService.getItemWinner(tenderId, itemId);
            return ResponseEntity.ok(winner);
        } catch (Exception e) {
            log.error("Ошибка при получении победителя позиции {} тендера {}: {}", itemId, tenderId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{tenderId}/winners/items")
    public ResponseEntity<List<TenderItemWinnerDto>> getAllItemWinners(@PathVariable UUID tenderId) {
        log.info("Получен запрос на всех победителей по позициям для тендера: {}", tenderId);
        
        try {
            List<TenderItemWinnerDto> winners = tenderWinnerService.getAllItemWinners(tenderId);
            return ResponseEntity.ok(winners);
        } catch (Exception e) {
            log.error("Ошибка при получении победителей по позициям для тендера {}: {}", tenderId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{tenderId}/winners/second-prices")
    public ResponseEntity<List<SupplierPriceDto>> getSecondPrices(@PathVariable UUID tenderId) {
        log.info("Получен запрос на вторые цены для тендера: {}", tenderId);
        
        try {
            List<SupplierPriceDto> secondPrices = tenderWinnerService.getSecondPrices(tenderId);
            return ResponseEntity.ok(secondPrices);
        } catch (Exception e) {
            log.error("Ошибка при получении вторых цен для тендера {}: {}", tenderId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{tenderId}/winners/savings")
    public ResponseEntity<Double> getTotalSavings(@PathVariable UUID tenderId) {
        log.info("Получен запрос на расчет экономии для тендера: {}", tenderId);
        
        try {
            Double savings = tenderWinnerService.calculateTotalSavings(tenderId);
            return ResponseEntity.ok(savings);
        } catch (Exception e) {
            log.error("Ошибка при расчете экономии для тендера {}: {}", tenderId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{tenderId}/winners/statistics")
    public ResponseEntity<TenderWinnerSummaryDto> getWinnerStatistics(@PathVariable UUID tenderId) {
        log.info("Получен запрос на статистику победителей для тендера: {}", tenderId);
        
        try {
            TenderWinnerSummaryDto statistics = tenderWinnerService.getWinnerStatistics(tenderId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Ошибка при получении статистики победителей для тендера {}: {}", tenderId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
