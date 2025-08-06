package ru.perminov.tender.dto;

import lombok.Data;
import ru.perminov.tender.model.Invoice;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class InvoiceDto {
    private UUID id;
    private UUID contractId;
    private String contractNumber;
    private UUID supplierId;
    private String supplierName;
    private String supplierContact;
    private String supplierPhone;
    private UUID customerId;
    private String customerName;
    private UUID requestId;
    private String requestNumber;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private LocalDate paymentDate;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private BigDecimal vatAmount;
    private String currency;
    private String paymentTerms;
    private String notes;
    private List<InvoiceItemDto> invoiceItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static InvoiceDto fromEntity(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        
        if (invoice.getContract() != null) {
            dto.setContractId(invoice.getContract().getId());
            dto.setContractNumber(invoice.getContract().getContractNumber());
            
            // Получаем данные заказчика из тендера контракта
            if (invoice.getContract().getTender() != null && invoice.getContract().getTender().getCustomer() != null) {
                dto.setCustomerId(invoice.getContract().getTender().getCustomer().getId());
                dto.setCustomerName(invoice.getContract().getTender().getCustomer().getName());
            }
        }
        
        if (invoice.getSupplier() != null) {
            dto.setSupplierId(invoice.getSupplier().getId());
            dto.setSupplierName(invoice.getSupplier().getName());
            dto.setSupplierPhone(invoice.getSupplier().getPhone());
            
            // Получаем контактное лицо поставщика
            if (!invoice.getSupplier().getContactPersons().isEmpty()) {
                var contactPerson = invoice.getSupplier().getContactPersons().get(0);
                dto.setSupplierContact(contactPerson.getFirstName() + " " + contactPerson.getLastName());
            }
        }
        
        if (invoice.getRequest() != null) {
            dto.setRequestId(invoice.getRequest().getId());
            dto.setRequestNumber(invoice.getRequest().getRequestNumber());
        }
        
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setPaymentDate(invoice.getPaymentDate());
        dto.setStatus(invoice.getStatus().name());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setPaidAmount(invoice.getPaidAmount());
        dto.setRemainingAmount(invoice.getRemainingAmount());
        dto.setVatAmount(invoice.getVatAmount());
        dto.setCurrency(invoice.getCurrency());
        dto.setPaymentTerms(invoice.getPaymentTerms());
        dto.setNotes(invoice.getNotes());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());
        
        return dto;
    }
} 