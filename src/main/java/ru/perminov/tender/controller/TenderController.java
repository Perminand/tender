package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.TenderItemDto;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.service.TenderService;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/tenders")
@RequiredArgsConstructor
public class TenderController {

    private final TenderService tenderService;

    @PostMapping
    public ResponseEntity<TenderDto> createTender(@RequestBody TenderDto tenderDto) {
        log.info("Получен POST-запрос: создать тендер. Данные: {}", tenderDto);
        return ResponseEntity.ok(tenderService.createTender(tenderDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TenderDto> updateTender(@PathVariable UUID id, @RequestBody TenderDto tenderDto) {
        log.info("Получен PUT-запрос: обновить тендер. id={}, данные: {}", id, tenderDto);
        return ResponseEntity.ok(tenderService.updateTender(id, tenderDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TenderDto> getTender(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тендер по id={}", id);
        return ResponseEntity.ok(tenderService.getTenderById(id));
    }

    @GetMapping
    public ResponseEntity<List<TenderDto>> getAllTenders() {
        log.info("Получен GET-запрос: получить все тендеры");
        return ResponseEntity.ok(tenderService.getAllTenders());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TenderDto>> getTendersByStatus(@PathVariable Tender.TenderStatus status) {
        log.info("Получен GET-запрос: получить тендеры по статусу {}", status);
        return ResponseEntity.ok(tenderService.getTendersByStatus(status));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<TenderDto>> getTendersByCustomer(@PathVariable UUID customerId) {
        log.info("Получен GET-запрос: получить тендеры по заказчику customerId={}", customerId);
        return ResponseEntity.ok(tenderService.getTendersByCustomer(customerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTender(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить тендер. id={}", id);
        tenderService.deleteTender(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<TenderDto> publishTender(@PathVariable UUID id) {
        log.info("Получен POST-запрос: опубликовать тендер. id={}", id);
        return ResponseEntity.ok(tenderService.publishTender(id));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<TenderDto> closeTender(@PathVariable UUID id) {
        log.info("Получен POST-запрос: закрыть тендер. id={}", id);
        return ResponseEntity.ok(tenderService.closeTender(id));
    }

    @GetMapping("/{id}/proposals")
    public ResponseEntity<List<SupplierProposalDto>> getTenderProposals(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить предложения по тендеру id={}", id);
        return ResponseEntity.ok(tenderService.getTenderProposals(id));
    }

    @GetMapping("/{id}/best-proposal")
    public ResponseEntity<SupplierProposalDto> getBestProposal(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить лучшее предложение по тендеру id={}", id);
        return ResponseEntity.ok(tenderService.getBestProposal(id));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<TenderItemDto>> getTenderItems(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить позиции тендера id={}", id);
        return ResponseEntity.ok(tenderService.getTenderItems(id));
    }

    @GetMapping("/{id}/with-best-offers")
    public ResponseEntity<TenderDto> getTenderWithBestOffers(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тендер с лучшими предложениями id={}", id);
        return ResponseEntity.ok(tenderService.getTenderWithBestOffers(id));
    }

    @GetMapping("/{id}/with-best-prices-by-items")
    public ResponseEntity<TenderDto> getTenderWithBestPricesByItems(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить тендер с лучшими ценами по позициям id={}", id);
        return ResponseEntity.ok(tenderService.getTenderWithBestPricesByItems(id));
    }

    @PostMapping("/{id}/start-bidding")
    public ResponseEntity<TenderDto> startBidding(@PathVariable UUID id) {
        log.info("Получен POST-запрос: начать прием предложений по тендеру. id={}", id);
        return ResponseEntity.ok(tenderService.startBidding(id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<TenderDto> completeTender(@PathVariable UUID id) {
        log.info("Получен POST-запрос: завершить тендер. id={}", id);
        return ResponseEntity.ok(tenderService.completeTender(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<TenderDto> cancelTender(@PathVariable UUID id) {
        log.info("Получен POST-запрос: отменить тендер. id={}", id);
        return ResponseEntity.ok(tenderService.cancelTender(id));
    }
} 