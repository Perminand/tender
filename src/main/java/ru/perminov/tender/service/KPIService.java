package ru.perminov.tender.service;

import ru.perminov.tender.dto.kpi.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface KPIService {
    
    /**
     * KPI по экономии средств
     */
    SavingsKPIDto calculateSavingsKPI(LocalDate startDate, LocalDate endDate);
    
    /**
     * KPI по времени проведения тендеров
     */
    TenderTimeKPIDto calculateTenderTimeKPI(LocalDate startDate, LocalDate endDate);
    
    /**
     * KPI по количеству предложений
     */
    ProposalCountKPIDto calculateProposalCountKPI(LocalDate startDate, LocalDate endDate);
    
    /**
     * KPI по качеству поставщиков
     */
    SupplierQualityKPIDto calculateSupplierQualityKPI(LocalDate startDate, LocalDate endDate);
    
    /**
     * KPI по соблюдению сроков поставок
     */
    DeliveryTimeKPIDto calculateDeliveryTimeKPI(LocalDate startDate, LocalDate endDate);
    
    /**
     * KPI по стоимости закупочного процесса
     */
    ProcurementCostKPIDto calculateProcurementCostKPI(LocalDate startDate, LocalDate endDate);
    
    /**
     * Общий дашборд KPI
     */
    ProcurementKPIDashboardDto getProcurementKPIDashboard();
    
    /**
     * Сравнение KPI с предыдущими периодами
     */
    KPITrendDto getKPITrends(String kpiType, LocalDate startDate, LocalDate endDate);
    
    /**
     * Рекомендации по улучшению KPI
     */
    List<KPIRecommendationDto> getKPIRecommendations();
    
    /**
     * Установка целей по KPI
     */
    void setKPITargets(KPITargetsDto targets);
    
    /**
     * Получение целей по KPI
     */
    KPITargetsDto getKPITargets();
} 