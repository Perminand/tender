package ru.perminov.tender.service;

import ru.perminov.tender.dto.tender.PriceAnalysisDto;
import ru.perminov.tender.dto.tender.PriceSummaryDto;
import ru.perminov.tender.dto.tender.SupplierPriceDto;

import java.util.List;
import java.util.UUID;

public interface PriceAnalysisService {
    
    /**
     * Получает полный анализ цен по тендеру
     */
    PriceAnalysisDto getPriceAnalysis(UUID tenderId);
    
    /**
     * Получает лучшие цены по каждой позиции тендера
     */
    List<SupplierPriceDto> getBestPricesByItems(UUID tenderId);
    
    /**
     * Получает сравнительную таблицу цен от всех поставщиков
     */
    List<SupplierPriceDto> getPriceComparison(UUID tenderId);
    
    /**
     * Находит поставщиков с лучшими ценами по каждой позиции
     */
    List<SupplierPriceDto> getSuppliersWithBestPrices(UUID tenderId);
    
    /**
     * Рассчитывает экономию по тендеру
     */
    double calculateSavings(UUID tenderId);
    
    /**
     * Получает статистику цен по тендеру
     */
    PriceSummaryDto getPriceStatistics(UUID tenderId);
    
    /**
     * Находит аномальные цены (слишком высокие или низкие)
     */
    List<SupplierPriceDto> getAnomalousPrices(UUID tenderId);
    
    /**
     * Получает рекомендации по выбору поставщиков
     */
    List<String> getSupplierRecommendations(UUID tenderId);
} 