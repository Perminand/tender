package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.ProposalItemDto;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.service.SupplierProposalService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
public class SupplierProposalController {

    private final SupplierProposalService supplierProposalService;

    @PostMapping
    public ResponseEntity<SupplierProposalDto> createProposal(@RequestBody SupplierProposalDto proposalDto) {
        return ResponseEntity.ok(supplierProposalService.createProposal(proposalDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierProposalDto> updateProposal(@PathVariable UUID id, @RequestBody SupplierProposalDto proposalDto) {
        return ResponseEntity.ok(supplierProposalService.updateProposal(id, proposalDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierProposalDto> getProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierProposalService.getProposalById(id));
    }

    @GetMapping("/tender/{tenderId}")
    public ResponseEntity<List<SupplierProposalDto>> getProposalsByTender(@PathVariable UUID tenderId) {
        return ResponseEntity.ok(supplierProposalService.getProposalsByTender(tenderId));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<SupplierProposalDto>> getProposalsBySupplier(@PathVariable UUID supplierId) {
        return ResponseEntity.ok(supplierProposalService.getProposalsBySupplier(supplierId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupplierProposalDto>> getProposalsByStatus(@PathVariable SupplierProposal.ProposalStatus status) {
        return ResponseEntity.ok(supplierProposalService.getProposalsByStatus(status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProposal(@PathVariable UUID id) {
        supplierProposalService.deleteProposal(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SupplierProposalDto> submitProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierProposalService.submitProposal(id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<SupplierProposalDto> acceptProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierProposalService.acceptProposal(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<SupplierProposalDto> rejectProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierProposalService.rejectProposal(id));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<ProposalItemDto>> getProposalItems(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierProposalService.getProposalItems(id));
    }

    @GetMapping("/tender/{tenderId}/best")
    public ResponseEntity<SupplierProposalDto> getBestProposalForTender(@PathVariable UUID tenderId) {
        return ResponseEntity.ok(supplierProposalService.getBestProposalForTender(tenderId));
    }

    @GetMapping("/{id}/with-best-offers")
    public ResponseEntity<SupplierProposalDto> getProposalWithBestOffers(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierProposalService.getProposalWithBestOffers(id));
    }
} 