package ru.perminov.tender.service;

import ru.perminov.tender.dto.FnsApiKeyDto;
import ru.perminov.tender.dto.SettingsDto;
import ru.perminov.tender.dto.EmailSettingsDto;

public interface SettingsService {
    
    SettingsDto getSettings();
    
    void saveFnsApiKey(FnsApiKeyDto apiKey);
    
    String getFnsApiKey();
    
    String getFnsApiUsage();
    
    EmailSettingsDto getEmailSettings();
    
    void saveEmailSettings(EmailSettingsDto emailSettings);
    
    boolean testEmailConnection(EmailSettingsDto emailSettings);
} 