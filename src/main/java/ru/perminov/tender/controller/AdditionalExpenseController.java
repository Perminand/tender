package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.AdditionalExpenseDto;
import ru.perminov.tender.model.AdditionalExpense;
import ru.perminov.tender.service.AdditionalExpenseService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/additional-expenses")
@RequiredArgsConstructor
@Slf4j
public class AdditionalExpenseController {

    private final AdditionalExpenseService additionalExpenseService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPLIER')")
    @PostMapping
    public ResponseEntity<AdditionalExpenseDto> createExpense(@RequestBody AdditionalExpenseDto expenseDto) {
        log.info("Создание дополнительного расхода для предложения: {}", expenseDto.getSupplierProposalId());
        return ResponseEntity.ok(additionalExpenseService.createExpense(expenseDto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SUPPLIER')")
    @PutMapping("/{id}")
    public ResponseEntity<AdditionalExpenseDto> updateExpense(@PathVariable UUID id, @RequestBody AdditionalExpenseDto expenseDto) {
        log.info("Обновление дополнительного расхода: {}", id);
        return ResponseEntity.ok(additionalExpenseService.updateExpense(id, expenseDto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'SUPPLIER')")
    @GetMapping("/{id}")
    public ResponseEntity<AdditionalExpenseDto> getExpenseById(@PathVariable UUID id) {
        log.info("Получение дополнительного расхода по ID: {}", id);
        return ResponseEntity.ok(additionalExpenseService.getExpenseById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'SUPPLIER')")
    @GetMapping("/proposal/{supplierProposalId}")
    public ResponseEntity<List<AdditionalExpenseDto>> getExpensesByProposal(@PathVariable UUID supplierProposalId) {
        log.info("Получение дополнительных расходов для предложения: {}", supplierProposalId);
        return ResponseEntity.ok(additionalExpenseService.getExpensesByProposal(supplierProposalId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AdditionalExpenseDto>> getExpensesByStatus(@PathVariable String status) {
        log.info("Получение дополнительных расходов по статусу: {}", status);
        AdditionalExpense.ExpenseStatus expenseStatus = AdditionalExpense.ExpenseStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(additionalExpenseService.getExpensesByStatus(expenseStatus));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable UUID id) {
        log.info("Удаление дополнительного расхода: {}", id);
        additionalExpenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}/status")
    public ResponseEntity<AdditionalExpenseDto> changeExpenseStatus(
            @PathVariable UUID id, 
            @RequestParam String status) {
        log.info("Изменение статуса дополнительного расхода {} на: {}", id, status);
        AdditionalExpense.ExpenseStatus expenseStatus = AdditionalExpense.ExpenseStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(additionalExpenseService.changeExpenseStatus(id, expenseStatus));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'SUPPLIER')")
    @GetMapping("/proposal/{supplierProposalId}/total-approved")
    public ResponseEntity<Double> getTotalApprovedAmountByProposal(@PathVariable UUID supplierProposalId) {
        log.info("Получение общей суммы одобренных дополнительных расходов для предложения: {}", supplierProposalId);
        return ResponseEntity.ok(additionalExpenseService.getTotalApprovedAmountByProposal(supplierProposalId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'SUPPLIER')")
    @GetMapping("/proposal/{supplierProposalId}/total-cost")
    public ResponseEntity<Double> calculateTotalProposalCost(@PathVariable UUID supplierProposalId) {
        log.info("Расчет общей стоимости предложения с учетом дополнительных расходов: {}", supplierProposalId);
        return ResponseEntity.ok(additionalExpenseService.calculateTotalProposalCost(supplierProposalId));
    }
}
