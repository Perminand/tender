package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.InvoiceDto;
import ru.perminov.tender.dto.InvoiceDtoNew;
import ru.perminov.tender.dto.InvoiceDtoUpdate;
import ru.perminov.tender.dto.InvoiceItemDto;
import ru.perminov.tender.service.InvoiceService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Slf4j
public class InvoiceController {
    
    private final InvoiceService invoiceService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<InvoiceDto> createInvoice(@RequestBody InvoiceDtoNew invoiceDtoNew) {
        log.info("Создание счета от поставщика: {}", invoiceDtoNew);
        return ResponseEntity.ok(invoiceService.createInvoice(invoiceDtoNew));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable UUID id) {
        log.info("Получение счета по id: {}", id);
        InvoiceDto dto = invoiceService.getInvoiceById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<InvoiceDto>> getAllInvoices() {
        log.info("Получение всех счетов");
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<InvoiceDto>> getInvoicesByRequest(@PathVariable UUID requestId) {
        log.info("Получение счетов по заявке: {}", requestId);
        return ResponseEntity.ok(invoiceService.getInvoicesByRequest(requestId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<InvoiceDto>> getInvoicesByContract(@PathVariable UUID contractId) {
        log.info("Получение счетов по контракту: {}", contractId);
        return ResponseEntity.ok(invoiceService.getInvoicesByContract(contractId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<InvoiceDto>> getInvoicesBySupplier(@PathVariable UUID supplierId) {
        log.info("Получение счетов по поставщику: {}", supplierId);
        return ResponseEntity.ok(invoiceService.getInvoicesBySupplier(supplierId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceDto>> getInvoicesByStatus(@PathVariable String status) {
        log.info("Получение счетов по статусу: {}", status);
        return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDto> updateInvoice(@PathVariable UUID id, @RequestBody InvoiceDtoUpdate invoiceDtoUpdate) {
        log.info("Обновление счета: {} с данными: {}", id, invoiceDtoUpdate);
        return ResponseEntity.ok(invoiceService.updateInvoice(id, invoiceDtoUpdate));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        log.info("Удаление счета: {}", id);
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/confirm")
    public ResponseEntity<InvoiceDto> confirmInvoice(@PathVariable UUID id) {
        log.info("Подтверждение счета: {}", id);
        return ResponseEntity.ok(invoiceService.confirmInvoice(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/pay")
    public ResponseEntity<InvoiceDto> payInvoice(@PathVariable UUID id, @RequestParam(required = false) Double amount) {
        log.info("Оплата счета: {} на сумму: {}", id, amount);
        return ResponseEntity.ok(invoiceService.payInvoice(id, amount));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<InvoiceDto> cancelInvoice(@PathVariable UUID id) {
        log.info("Отмена счета: {}", id);
        return ResponseEntity.ok(invoiceService.cancelInvoice(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceDto>> getOverdueInvoices() {
        log.info("Получение просроченных счетов");
        return ResponseEntity.ok(invoiceService.getOverdueInvoices());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/pending-payment")
    public ResponseEntity<List<InvoiceDto>> getPendingPaymentInvoices() {
        log.info("Получение счетов ожидающих оплаты");
        return ResponseEntity.ok(invoiceService.getPendingPaymentInvoices());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/{id}/items")
    public ResponseEntity<List<InvoiceItemDto>> getInvoiceItems(@PathVariable UUID id) {
        log.info("Получение позиций счета: {}", id);
        return ResponseEntity.ok(invoiceService.getInvoiceItems(id));
    }
} 