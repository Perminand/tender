package ru.perminov.tender.service;

import ru.perminov.tender.dto.FnsApiKeyDto;
import ru.perminov.tender.dto.SettingsDto;

public interface SettingsService {
    
    SettingsDto getSettings();
    
    void saveFnsApiKey(FnsApiKeyDto apiKey);
    
    String getFnsApiKey();
    
    String getFnsApiUsage();
} 