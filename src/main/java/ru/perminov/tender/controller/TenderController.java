package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.TenderItemDto;
import ru.perminov.tender.dto.tender.PriceSummaryDto;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.service.TenderService;
import ru.perminov.tender.service.PriceAnalysisService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/tenders")
@RequiredArgsConstructor
public class TenderController {

    private final TenderService tenderService;
    private final PriceAnalysisService priceAnalysisService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<TenderDto> createTender(@RequestBody TenderDto tenderDto) {
        log.info("Получен POST-запрос: создать тендер. Данные: {}", tenderDto);
        log.info("RequestId в DTO: {}", tenderDto.getRequestId());
        TenderDto createdTender = tenderService.createTender(tenderDto);
        log.info("Тендер создан успешно. ID: {}, requestId: {}", createdTender.getId(), createdTender.getRequestId());
        return ResponseEntity.ok(createdTender);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<TenderDto> updateTender(@PathVariable UUID id, @RequestBody TenderDto tenderDto) {
        log.info("Получен PUT-запрос: обновить тендер. id={}, данные: {}", id, tenderDto);
        return ResponseEntity.ok(tenderService.updateTender(id, tenderDto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPLIER', 'VIEWER')")
    @GetMapping("/{id}")
    public ResponseEntity<TenderDto> getTender(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тендер по id={}", id);
        return ResponseEntity.ok(tenderService.getTenderById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPLIER', 'VIEWER')")
    @GetMapping
    public ResponseEntity<List<TenderDto>> getAllTenders() {
        log.info("Получен GET-запрос: получить все тендеры");
        return ResponseEntity.ok(tenderService.getAllTenders());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPLIER', 'VIEWER')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TenderDto>> getTendersByStatus(@PathVariable Tender.TenderStatus status) {
        log.info("Получен GET-запрос: получить тендеры по статусу {}", status);
        return ResponseEntity.ok(tenderService.getTendersByStatus(status));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPLIER', 'VIEWER')")
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<TenderDto>> getTendersByCustomer(@PathVariable UUID customerId) {
        log.info("Получен GET-запрос: получить тендеры по заказчику customerId={}", customerId);
        return ResponseEntity.ok(tenderService.getTendersByCustomer(customerId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTender(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить тендер. id={}", id);
        tenderService.deleteTender(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/publish")
    public ResponseEntity<TenderDto> publishTender(@PathVariable UUID id) {
        log.info("Получен POST-запрос: опубликовать тендер. id={}", id);
        return ResponseEntity.ok(tenderService.publishTender(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/close")
    public ResponseEntity<TenderDto> closeTender(@PathVariable UUID id) {
        log.info("Получен POST-запрос: закрыть тендер. id={}", id);
        return ResponseEntity.ok(tenderService.closeTender(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/proposals")
    public ResponseEntity<List<SupplierProposalDto>> getTenderProposals(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить предложения по тендеру id={}", id);
        return ResponseEntity.ok(tenderService.getTenderProposals(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/best-proposal")
    public ResponseEntity<SupplierProposalDto> getBestProposal(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить лучшее предложение по тендеру id={}", id);
        return ResponseEntity.ok(tenderService.getBestProposal(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPLIER', 'VIEWER')")
    @GetMapping("/{id}/items")
    public ResponseEntity<List<TenderItemDto>> getTenderItems(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить позиции тендера id={}", id);
        List<TenderItemDto> items = tenderService.getTenderItems(id);
        log.info("Найдено позиций тендера: {}", items.size());
        return ResponseEntity.ok(items);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/with-best-offers")
    public ResponseEntity<TenderDto> getTenderWithBestOffers(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тендер с лучшими предложениями id={}", id);
        return ResponseEntity.ok(tenderService.getTenderWithBestOffers(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPLIER', 'VIEWER')")
    @GetMapping("/{id}/with-best-prices-by-items")
    public ResponseEntity<TenderDto> getTenderWithBestPricesByItems(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тендер с лучшими ценами по позициям id={}", id);
        return ResponseEntity.ok(tenderService.getTenderWithBestPricesByItems(id));
    }

    @PreAuthorize("hasAnyRole('SUPPLIER')")
    @GetMapping("/{id}/supplier-view")
    public ResponseEntity<TenderDto> getTenderForSupplier(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тендер для поставщика id={}", id);
        return ResponseEntity.ok(tenderService.getTenderForSupplier(id));
    }

    @PreAuthorize("hasAnyRole('SUPPLIER')")
    @GetMapping("/supplier-list")
    public ResponseEntity<List<TenderDto>> getAllTendersForSupplier() {
        log.info("Получен GET-запрос: получить список тендеров для поставщика");
        return ResponseEntity.ok(tenderService.getAllTendersForSupplier());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/start-bidding")
    public ResponseEntity<TenderDto> startBidding(@PathVariable UUID id) {
        log.info("Получен POST-запрос: начать прием предложений по тендеру. id={}", id);
        return ResponseEntity.ok(tenderService.startBidding(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/complete")
    public ResponseEntity<TenderDto> completeTender(@PathVariable UUID id) {
        log.info("Получен POST-запрос: завершить тендер. id={}", id);
        return ResponseEntity.ok(tenderService.completeTender(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<TenderDto> cancelTender(@PathVariable UUID id) {
        log.info("Получен POST-запрос: отменить тендер. id={}", id);
        return ResponseEntity.ok(tenderService.cancelTender(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{tenderId}/items/{itemId}/award")
    public ResponseEntity<Void> awardTenderItem(@PathVariable UUID tenderId, @PathVariable UUID itemId, @RequestBody Map<String, String> body) {
        String supplierIdStr = body.get("supplierId");
        if (supplierIdStr == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            tenderService.awardTenderItem(tenderId, itemId, UUID.fromString(supplierIdStr));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/award")
    public ResponseEntity<TenderDto> awardTender(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String supplierIdStr = body.get("supplierId");
        try {
            TenderDto dto = supplierIdStr == null || supplierIdStr.isEmpty()
                ? tenderService.awardTender(id, null)
                : tenderService.awardTender(id, UUID.fromString(supplierIdStr));
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/set-status")
    public ResponseEntity<TenderDto> setTenderStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        TenderDto dto = tenderService.setTenderStatus(id, status);
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/price-analysis")
    public ResponseEntity<ru.perminov.tender.dto.tender.PriceAnalysisDto> getTenderPriceAnalysis(@PathVariable UUID id) {
        log.info("Получен GET-запрос: анализ цен для тендера id={}", id);
        return ResponseEntity.ok(tenderService.getTenderPriceAnalysis(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/best-prices")
    public ResponseEntity<List<ru.perminov.tender.dto.tender.SupplierPriceDto>> getTenderBestPrices(@PathVariable UUID id) {
        log.info("Получен GET-запрос: лучшие цены для тендера id={}", id);
        return ResponseEntity.ok(tenderService.getTenderBestPrices(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/price-comparison")
    public ResponseEntity<List<ru.perminov.tender.dto.tender.SupplierPriceDto>> getTenderPriceComparison(@PathVariable UUID id) {
        log.info("Получен GET-запрос: сравнительная таблица цен для тендера id={}", id);
        return ResponseEntity.ok(tenderService.getTenderPriceComparison(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/savings")
    public ResponseEntity<Double> getTenderSavings(@PathVariable UUID id) {
        log.info("Получен GET-запрос: экономия по тендеру id={}", id);
        return ResponseEntity.ok(tenderService.getTenderSavings(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<String>> getTenderRecommendations(@PathVariable UUID id) {
        log.info("Получен GET-запрос: рекомендации по тендеру id={}", id);
        return ResponseEntity.ok(tenderService.getTenderRecommendations(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/statistics")
    public ResponseEntity<PriceSummaryDto> getTenderStatistics(@PathVariable UUID id) {
        log.info("Получен GET-запрос: статистика по тендеру id={}", id);
        return ResponseEntity.ok(priceAnalysisService.getPriceStatistics(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/split")
    public ResponseEntity<ru.perminov.tender.dto.tender.TenderSplitResponseDto> splitTender(
            @PathVariable UUID id,
            @RequestBody ru.perminov.tender.dto.tender.TenderSplitRequestDto splitRequest) {
        log.info("Получен POST-запрос: разделить тендер. id={}, данные: {}", id, splitRequest);
        splitRequest.setTenderId(id);
        return ResponseEntity.ok(tenderService.splitTender(splitRequest));
    }
} 