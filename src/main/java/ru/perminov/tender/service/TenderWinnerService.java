package ru.perminov.tender.service;

import ru.perminov.tender.dto.tender.TenderWinnerDto;
import ru.perminov.tender.dto.tender.TenderItemWinnerDto;
import ru.perminov.tender.dto.tender.SupplierPriceDto;
import ru.perminov.tender.dto.tender.TenderWinnerSummaryDto;

import java.util.List;
import java.util.UUID;

public interface TenderWinnerService {
    
    /**
     * Определить победителей по каждой позиции тендера с учетом НДС и доставки
     */
    TenderWinnerDto determineWinners(UUID tenderId);
    
    /**
     * Получить победителя по конкретной позиции
     */
    TenderItemWinnerDto getItemWinner(UUID tenderId, UUID itemId);
    
    /**
     * Получить всех победителей по позициям
     */
    List<TenderItemWinnerDto> getAllItemWinners(UUID tenderId);
    
    /**
     * Получить вторые цены по всем позициям
     */
    List<SupplierPriceDto> getSecondPrices(UUID tenderId);
    
    /**
     * Рассчитать экономию с учетом НДС и доставки
     */
    Double calculateTotalSavings(UUID tenderId);
    
    /**
     * Получить статистику по победителям
     */
    TenderWinnerSummaryDto getWinnerStatistics(UUID tenderId);
}
