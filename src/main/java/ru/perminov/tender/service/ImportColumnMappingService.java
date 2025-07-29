package ru.perminov.tender.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.perminov.tender.model.ImportColumnMapping;
import ru.perminov.tender.repository.ImportColumnMappingRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ImportColumnMappingService {
    @Autowired
    private ImportColumnMappingRepository repository;

    public Optional<ImportColumnMapping> getMapping(String userId, String companyId) {
        return repository.findByUserIdAndCompanyId(userId, companyId);
    }

    public ImportColumnMapping saveOrUpdateMapping(String userId, String companyId, String mappingJson) {
        Optional<ImportColumnMapping> existing = repository.findByUserIdAndCompanyId(userId, companyId);
        ImportColumnMapping mapping = existing.orElseGet(ImportColumnMapping::new);
        mapping.setUserId(userId);
        mapping.setCompanyId(companyId);
        mapping.setMappingJson(mappingJson);
        LocalDateTime now = LocalDateTime.now();
        if (mapping.getCreatedAt() == null) mapping.setCreatedAt(now);
        mapping.setUpdatedAt(now);
        return repository.save(mapping);
    }
} 