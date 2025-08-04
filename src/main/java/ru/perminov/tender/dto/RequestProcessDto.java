package ru.perminov.tender.dto;

import lombok.Data;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.model.Contract;
import ru.perminov.tender.model.Invoice;
import ru.perminov.tender.model.Delivery;
import ru.perminov.tender.model.Receipt;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class RequestProcessDto {
    private UUID requestId;
    private String requestNumber;
    private LocalDate requestDate;
    private String organization;
    private String project;
    private String location;
    private String applicant;
    private String approver;
    private String performer;
    private LocalDate deliveryDeadline;
    private String status;
    private String notes;
    
    // Финансовая информация
    private BigDecimal requestTotalAmount;
    private BigDecimal tenderTotalAmount;
    private BigDecimal deltaAmount;
    
    // Статистика
    private int materialsCount;
    private List<String> materials;
    private int tendersCount;
    private int proposalsCount;
    private int contractsCount;
    private int invoicesCount;
    private int deliveriesCount;
    private int receiptsCount;
    
    // Детальная информация
    private List<TenderProcessDto> tenders;
    private List<InvoiceProcessDto> invoices;
    private List<DeliveryProcessDto> deliveries;
    
    @Data
    public static class TenderProcessDto {
        private UUID tenderId;
        private String tenderNumber;
        private LocalDate tenderDate;
        private String status;
        private BigDecimal totalAmount;
        private int proposalsCount;
        private int selectedProposalsCount;
        private List<SupplierProposalDto> proposals;
    }
    
    @Data
    public static class SupplierProposalDto {
        private UUID proposalId;
        private String proposalNumber;
        private String supplierName;
        private String supplierContact;
        private String supplierPhone;
        private LocalDate submissionDate;
        private String status;
        private BigDecimal totalPrice;
        private String currency;
    }
    
    @Data
    public static class InvoiceProcessDto {
        private UUID invoiceId;
        private String invoiceNumber;
        private LocalDate invoiceDate;
        private LocalDate paymentDate;
        private String supplierName;
        private String supplierContact;
        private String supplierPhone;
        private String status;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal remainingAmount;
        private String currency;
        private List<ReceiptProcessDto> receipts;
    }
    
    @Data
    public static class DeliveryProcessDto {
        private UUID deliveryId;
        private String deliveryNumber;
        private LocalDate deliveryDate;
        private String supplierName;
        private String status;
        private BigDecimal totalAmount;
        private List<ReceiptProcessDto> receipts;
    }
    
    @Data
    public static class ReceiptProcessDto {
        private UUID receiptId;
        private String receiptNumber;
        private LocalDate receiptDate;
        private String status;
        private BigDecimal totalAmount;
        private String currency;
    }
} 