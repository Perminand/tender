package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.report.SupplierReportDto;
import ru.perminov.tender.dto.report.FinancialReportDto;
import ru.perminov.tender.dto.report.OperationalReportDto;
import ru.perminov.tender.service.ReportingService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {
    
    private final ReportingService reportingService;
    
    // Отчеты по поставщикам
    @GetMapping("/suppliers/{supplierId}")
    public ResponseEntity<SupplierReportDto> getSupplierReport(
            @PathVariable UUID supplierId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: отчет по поставщику id={}, период: {} - {}", supplierId, startDate, endDate);
        return ResponseEntity.ok(reportingService.generateSupplierReport(supplierId, startDate, endDate));
    }
    
    @GetMapping("/suppliers/top")
    public ResponseEntity<List<SupplierReportDto>> getTopSuppliersReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") Integer limit) {
        log.info("Получен GET-запрос: отчет топ поставщиков, период: {} - {}, лимит: {}", startDate, endDate, limit);
        return ResponseEntity.ok(reportingService.generateTopSuppliersReport(startDate, endDate, limit));
    }
    
    @GetMapping("/suppliers/problematic")
    public ResponseEntity<List<SupplierReportDto>> getProblematicSuppliersReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: отчет проблемных поставщиков, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateProblematicSuppliersReport(startDate, endDate));
    }
    
    // Финансовые отчеты
    @GetMapping("/financial")
    public ResponseEntity<FinancialReportDto> getFinancialReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: финансовый отчет, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateFinancialReport(startDate, endDate));
    }
    
    @GetMapping("/financial/budget")
    public ResponseEntity<FinancialReportDto> getBudgetReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: бюджетный отчет, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateBudgetReport(startDate, endDate));
    }
    
    @GetMapping("/financial/debt")
    public ResponseEntity<FinancialReportDto> getDebtReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: отчет по задолженности, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateDebtReport(startDate, endDate));
    }
    
    @GetMapping("/financial/savings")
    public ResponseEntity<FinancialReportDto> getSavingsReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: отчет по экономии, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateSavingsReport(startDate, endDate));
    }
    
    // Операционные отчеты
    @GetMapping("/operational")
    public ResponseEntity<OperationalReportDto> getOperationalReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: операционный отчет, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateOperationalReport(startDate, endDate));
    }
    
    @GetMapping("/operational/quality")
    public ResponseEntity<OperationalReportDto> getQualityReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: отчет по качеству, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateQualityReport(startDate, endDate));
    }
    
    @GetMapping("/operational/efficiency")
    public ResponseEntity<OperationalReportDto> getEfficiencyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: отчет по эффективности, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateEfficiencyReport(startDate, endDate));
    }
    
    @GetMapping("/operational/delivery")
    public ResponseEntity<OperationalReportDto> getDeliveryReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: отчет по поставкам, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateDeliveryReport(startDate, endDate));
    }
    
    // Сводные отчеты
    @GetMapping("/executive-summary")
    public ResponseEntity<FinancialReportDto> getExecutiveSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: исполнительное резюме, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generateExecutiveSummary(startDate, endDate));
    }
    
    @GetMapping("/performance-summary")
    public ResponseEntity<OperationalReportDto> getPerformanceSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: сводка по производительности, период: {} - {}", startDate, endDate);
        return ResponseEntity.ok(reportingService.generatePerformanceSummary(startDate, endDate));
    }
    
    // Экспорт отчетов
    @GetMapping("/export/suppliers/{supplierId}/excel")
    public ResponseEntity<byte[]> exportSupplierReportToExcel(
            @PathVariable UUID supplierId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: экспорт отчета по поставщику в Excel, id={}, период: {} - {}", supplierId, startDate, endDate);
        byte[] excelData = reportingService.exportSupplierReportToExcel(supplierId, startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=supplier_report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }
    
    @GetMapping("/export/financial/excel")
    public ResponseEntity<byte[]> exportFinancialReportToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: экспорт финансового отчета в Excel, период: {} - {}", startDate, endDate);
        byte[] excelData = reportingService.exportFinancialReportToExcel(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=financial_report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }
    
    @GetMapping("/export/operational/excel")
    public ResponseEntity<byte[]> exportOperationalReportToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: экспорт операционного отчета в Excel, период: {} - {}", startDate, endDate);
        byte[] excelData = reportingService.exportOperationalReportToExcel(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=operational_report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }
    
    @GetMapping("/export/{reportType}/pdf")
    public ResponseEntity<byte[]> exportReportToPDF(
            @PathVariable String reportType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Получен GET-запрос: экспорт отчета в PDF, тип: {}, период: {} - {}", reportType, startDate, endDate);
        byte[] pdfData = reportingService.exportReportToPDF(reportType, startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + reportType + "_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }
} 