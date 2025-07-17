package ru.perminov.tender.service;

import ru.perminov.tender.dto.dashboard.DashboardDto;

import java.time.LocalDate;

public interface DashboardService {
    
    // Основной дашборд
    DashboardDto getMainDashboard(String username);
    DashboardDto getDashboardForPeriod(String username, LocalDate startDate, LocalDate endDate);
    
    // Специализированные дашборды
    DashboardDto getFinancialDashboard(String username);
    DashboardDto getOperationalDashboard(String username);
    DashboardDto getSupplierDashboard(String username);
    DashboardDto getQualityDashboard(String username);
    
    // Персонализированные дашборды
    DashboardDto getPersonalizedDashboard(String username, String preferences);
    DashboardDto getExecutiveDashboard(String username);
    DashboardDto getManagerDashboard(String username);
    
    // Обновление данных в реальном времени
    DashboardDto refreshDashboard(String username);
    DashboardDto getLiveMetrics(String username);
    
    // Экспорт дашборда
    byte[] exportDashboardToPDF(String username);
    byte[] exportDashboardToExcel(String username);
    
    // Настройки дашборда
    void saveDashboardPreferences(String username, String preferences);
    String getDashboardPreferences(String username);
    
    // Уведомления дашборда
    void sendDashboardAlerts(String username);
    void sendDashboardDigest(String username);
} 