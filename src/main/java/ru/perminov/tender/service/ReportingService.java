package ru.perminov.tender.service;

import ru.perminov.tender.dto.report.SupplierReportDto;
import ru.perminov.tender.dto.report.FinancialReportDto;
import ru.perminov.tender.dto.report.OperationalReportDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReportingService {
    
    // Отчеты по поставщикам
    SupplierReportDto generateSupplierReport(UUID supplierId, LocalDate startDate, LocalDate endDate);
    List<SupplierReportDto> generateSupplierComparisonReport(List<UUID> supplierIds, LocalDate startDate, LocalDate endDate);
    List<SupplierReportDto> generateTopSuppliersReport(LocalDate startDate, LocalDate endDate, Integer limit);
    List<SupplierReportDto> generateProblematicSuppliersReport(LocalDate startDate, LocalDate endDate);
    
    // Финансовые отчеты
    FinancialReportDto generateFinancialReport(LocalDate startDate, LocalDate endDate);
    FinancialReportDto generateBudgetReport(LocalDate startDate, LocalDate endDate);
    FinancialReportDto generateDebtReport(LocalDate startDate, LocalDate endDate);
    FinancialReportDto generateSavingsReport(LocalDate startDate, LocalDate endDate);
    
    // Операционные отчеты
    OperationalReportDto generateOperationalReport(LocalDate startDate, LocalDate endDate);
    OperationalReportDto generateQualityReport(LocalDate startDate, LocalDate endDate);
    OperationalReportDto generateEfficiencyReport(LocalDate startDate, LocalDate endDate);
    OperationalReportDto generateDeliveryReport(LocalDate startDate, LocalDate endDate);
    
    // Сводные отчеты
    FinancialReportDto generateExecutiveSummary(LocalDate startDate, LocalDate endDate);
    OperationalReportDto generatePerformanceSummary(LocalDate startDate, LocalDate endDate);
    
    // Экспорт отчетов
    byte[] exportSupplierReportToExcel(UUID supplierId, LocalDate startDate, LocalDate endDate);
    byte[] exportFinancialReportToExcel(LocalDate startDate, LocalDate endDate);
    byte[] exportOperationalReportToExcel(LocalDate startDate, LocalDate endDate);
    byte[] exportReportToPDF(String reportType, LocalDate startDate, LocalDate endDate);
    
    // Автоматические отчеты
    void generateDailyReport();
    void generateWeeklyReport();
    void generateMonthlyReport();
    void generateQuarterlyReport();
} 