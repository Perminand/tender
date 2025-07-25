package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.ProposalItemDto;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.service.SupplierProposalService;
import ru.perminov.tender.service.ProposalRegistryService;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
public class SupplierProposalController {

    private final SupplierProposalService supplierProposalService;
    private final ProposalRegistryService proposalRegistryService;

    @PostMapping
    public ResponseEntity<SupplierProposalDto> createProposal(@Valid @RequestBody SupplierProposalDto proposalDto) {
        log.info("Получен POST-запрос: создать предложение поставщика. Данные: {}", proposalDto);
        return ResponseEntity.ok(supplierProposalService.createProposal(proposalDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierProposalDto> updateProposal(@PathVariable UUID id, @Valid @RequestBody SupplierProposalDto proposalDto) {
        log.info("Получен PUT-запрос: обновить предложение поставщика. id={}, данные: {}", id, proposalDto);
        return ResponseEntity.ok(supplierProposalService.updateProposal(id, proposalDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierProposalDto> getProposal(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить предложение поставщика по id={}", id);
        return ResponseEntity.ok(supplierProposalService.getProposalById(id));
    }

    @GetMapping("/tender/{tenderId}")
    public ResponseEntity<List<SupplierProposalDto>> getProposalsByTender(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: получить предложения по тендеру tenderId={}", tenderId);
        return ResponseEntity.ok(supplierProposalService.getProposalsByTender(tenderId));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<SupplierProposalDto>> getProposalsBySupplier(@PathVariable UUID supplierId) {
        log.info("Получен GET-запрос: получить предложения по поставщику supplierId={}", supplierId);
        return ResponseEntity.ok(supplierProposalService.getProposalsBySupplier(supplierId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupplierProposalDto>> getProposalsByStatus(@PathVariable SupplierProposal.ProposalStatus status) {
        log.info("Получен GET-запрос: получить предложения по статусу {}", status);
        return ResponseEntity.ok(supplierProposalService.getProposalsByStatus(status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProposal(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить предложение поставщика. id={}", id);
        supplierProposalService.deleteProposal(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SupplierProposalDto> submitProposal(@PathVariable UUID id) {
        log.info("Получен POST-запрос: подать предложение поставщика. id={}", id);
        return ResponseEntity.ok(supplierProposalService.submitProposal(id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<SupplierProposalDto> acceptProposal(@PathVariable UUID id) {
        log.info("Получен POST-запрос: принять предложение поставщика. id={}", id);
        return ResponseEntity.ok(supplierProposalService.acceptProposal(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<SupplierProposalDto> rejectProposal(@PathVariable UUID id) {
        log.info("Получен POST-запрос: отклонить предложение поставщика. id={}", id);
        return ResponseEntity.ok(supplierProposalService.rejectProposal(id));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<ProposalItemDto>> getProposalItems(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить позиции предложения id={}", id);
        return ResponseEntity.ok(supplierProposalService.getProposalItems(id));
    }

    @GetMapping("/tender/{tenderId}/best")
    public ResponseEntity<SupplierProposalDto> getBestProposalForTender(@PathVariable UUID tenderId) {
        log.info("Получен GET-запрос: получить лучшее предложение по тендеру tenderId={}", tenderId);
        return ResponseEntity.ok(supplierProposalService.getBestProposalForTender(tenderId));
    }

    @GetMapping("/{id}/with-best-offers")
    public ResponseEntity<SupplierProposalDto> getProposalWithBestOffers(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить предложение с лучшими ценами id={}", id);
        return ResponseEntity.ok(supplierProposalService.getProposalWithBestOffers(id));
    }

    @GetMapping
    public List<SupplierProposalDto> getAllProposals() {
        return supplierProposalService.getAllProposals();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportProposalsToExcel() {
        log.info("Получен GET-запрос: экспортировать предложения в Excel");
        try {
            var in = proposalRegistryService.exportProposalsToExcel();
            byte[] bytes = in.readAllBytes();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=proposals.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bytes);
        } catch (Exception e) {
            log.error("Ошибка при экспорте предложений в Excel", e);
            return ResponseEntity.internalServerError().body(null);
        }
    }
} 