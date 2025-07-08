package ru.perminov.tender.service;

import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.SupplierProposal;

import java.util.List;
import java.util.UUID;

public interface IntegrationService {
    
    /**
     * Интеграция с 1С для синхронизации контрагентов
     */
    void syncCompaniesWith1C();
    
    /**
     * Интеграция с системой складского учета
     */
    void syncInventoryData();
    
    /**
     * Интеграция с банковской системой для платежей
     */
    boolean processPayment(String paymentId, String bankReference);
    
    /**
     * Интеграция с системой электронного документооборота
     */
    String sendDocumentToEDO(String documentId);
    
    /**
     * Интеграция с системой ГИС (Государственная информационная система)
     */
    boolean publishTenderToGIS(Tender tender);
    
    /**
     * Интеграция с системой мониторинга цен
     */
    List<PriceMonitoringDto> getPriceMonitoringData(String materialCode);
    
    /**
     * Интеграция с системой проверки контрагентов
     */
    CompanyVerificationDto verifyCompany(Company company);
    
    /**
     * Интеграция с системой логистики
     */
    LogisticsInfoDto getLogisticsInfo(String deliveryId);
    
    /**
     * Синхронизация с внешней системой учета
     */
    void syncWithExternalAccounting();
    
    /**
     * Получение данных о курсах валют
     */
    ExchangeRateDto getExchangeRate(String currency);
    
    /**
     * Проверка доступности внешних систем
     */
    SystemHealthDto checkExternalSystemsHealth();
} 