package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.TenderItemDto;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.service.TenderService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenders")
@RequiredArgsConstructor
public class TenderController {

    private final TenderService tenderService;

    @PostMapping
    public ResponseEntity<TenderDto> createTender(@RequestBody TenderDto tenderDto) {
        return ResponseEntity.ok(tenderService.createTender(tenderDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TenderDto> updateTender(@PathVariable UUID id, @RequestBody TenderDto tenderDto) {
        return ResponseEntity.ok(tenderService.updateTender(id, tenderDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TenderDto> getTender(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.getTenderById(id));
    }

    @GetMapping
    public ResponseEntity<List<TenderDto>> getAllTenders() {
        return ResponseEntity.ok(tenderService.getAllTenders());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TenderDto>> getTendersByStatus(@PathVariable Tender.TenderStatus status) {
        return ResponseEntity.ok(tenderService.getTendersByStatus(status));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<TenderDto>> getTendersByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(tenderService.getTendersByCustomer(customerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTender(@PathVariable UUID id) {
        tenderService.deleteTender(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<TenderDto> publishTender(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.publishTender(id));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<TenderDto> closeTender(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.closeTender(id));
    }

    @GetMapping("/{id}/proposals")
    public ResponseEntity<List<SupplierProposalDto>> getTenderProposals(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.getTenderProposals(id));
    }

    @GetMapping("/{id}/best-proposal")
    public ResponseEntity<SupplierProposalDto> getBestProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.getBestProposal(id));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<TenderItemDto>> getTenderItems(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.getTenderItems(id));
    }

    @GetMapping("/{id}/with-best-offers")
    public ResponseEntity<TenderDto> getTenderWithBestOffers(@PathVariable UUID id) {
        return ResponseEntity.ok(tenderService.getTenderWithBestOffers(id));
    }
} 