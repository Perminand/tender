package ru.perminov.tender.service;

import ru.perminov.tender.dto.report.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReportingService {
    
    /**
     * Отчет по тендерам за период
     */
    TenderReportDto generateTenderReport(LocalDate startDate, LocalDate endDate, UUID customerId);
    
    /**
     * Отчет по поставщикам
     */
    SupplierReportDto generateSupplierReport(LocalDate startDate, LocalDate endDate);
    
    /**
     * Отчет по экономии
     */
    SavingsReportDto generateSavingsReport(LocalDate startDate, LocalDate endDate);
    
    /**
     * Отчет по контрактам
     */
    ContractReportDto generateContractReport(LocalDate startDate, LocalDate endDate);
    
    /**
     * Отчет по поставкам
     */
    DeliveryReportDto generateDeliveryReport(LocalDate startDate, LocalDate endDate);
    
    /**
     * Отчет по платежам
     */
    PaymentReportDto generatePaymentReport(LocalDate startDate, LocalDate endDate);
    
    /**
     * Дашборд закупок
     */
    ProcurementDashboardDto getProcurementDashboard();
    
    /**
     * Экспорт отчета в Excel
     */
    byte[] exportReportToExcel(String reportType, LocalDate startDate, LocalDate endDate);
    
    /**
     * Экспорт отчета в PDF
     */
    byte[] exportReportToPdf(String reportType, LocalDate startDate, LocalDate endDate);
} 