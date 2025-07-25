package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.PriceAnalysisDto;
import ru.perminov.tender.dto.tender.SupplierPriceDto;
import ru.perminov.tender.dto.tender.PriceSummaryDto;
import ru.perminov.tender.service.PriceAnalysisService;
import ru.perminov.tender.service.PriceAnalysisExportService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/price-analysis")
@RequiredArgsConstructor
public class PriceAnalysisController {

    private final PriceAnalysisService priceAnalysisService;
    private final PriceAnalysisExportService priceAnalysisExportService;

    @GetMapping("/tender/{tenderId}")
    public ResponseEntity<PriceAnalysisDto> getPriceAnalysis(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: анализ цен для тендера id={}", tenderId);
        return ResponseEntity.ok(priceAnalysisService.getPriceAnalysis(tenderId));
    }

    @GetMapping("/tender/{tenderId}/best-prices")
    public ResponseEntity<List<SupplierPriceDto>> getBestPricesByItems(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: лучшие цены по позициям для тендера id={}", tenderId);
        return ResponseEntity.ok(priceAnalysisService.getBestPricesByItems(tenderId));
    }

    @GetMapping("/tender/{tenderId}/comparison")
    public ResponseEntity<List<SupplierPriceDto>> getPriceComparison(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: сравнительная таблица цен для тендера id={}", tenderId);
        return ResponseEntity.ok(priceAnalysisService.getPriceComparison(tenderId));
    }

    @GetMapping("/tender/{tenderId}/best-suppliers")
    public ResponseEntity<List<SupplierPriceDto>> getSuppliersWithBestPrices(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: поставщики с лучшими ценами для тендера id={}", tenderId);
        return ResponseEntity.ok(priceAnalysisService.getSuppliersWithBestPrices(tenderId));
    }

    @GetMapping("/tender/{tenderId}/savings")
    public ResponseEntity<Double> calculateSavings(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: расчет экономии для тендера id={}", tenderId);
        return ResponseEntity.ok(priceAnalysisService.calculateSavings(tenderId));
    }

    @GetMapping("/tender/{tenderId}/statistics")
    public ResponseEntity<PriceSummaryDto> getPriceStatistics(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: статистика цен для тендера id={}", tenderId);
        return ResponseEntity.ok(priceAnalysisService.getPriceStatistics(tenderId));
    }

    @GetMapping("/tender/{tenderId}/anomalous")
    public ResponseEntity<List<SupplierPriceDto>> getAnomalousPrices(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: аномальные цены для тендера id={}", tenderId);
        return ResponseEntity.ok(priceAnalysisService.getAnomalousPrices(tenderId));
    }

    @GetMapping("/tender/{tenderId}/recommendations")
    public ResponseEntity<List<String>> getSupplierRecommendations(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: рекомендации по поставщикам для тендера id={}", tenderId);
        return ResponseEntity.ok(priceAnalysisService.getSupplierRecommendations(tenderId));
    }

    @GetMapping("/tender/{tenderId}/export")
    public ResponseEntity<byte[]> exportPriceAnalysisToExcel(@PathVariable UUID tenderId) {
        try {
            var out = priceAnalysisExportService.exportPriceAnalysisToExcel(tenderId);
            String filename = "price-analysis-" + tenderId + ".xlsx";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }
} 