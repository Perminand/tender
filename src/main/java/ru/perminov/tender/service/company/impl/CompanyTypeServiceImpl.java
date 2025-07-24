package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.companyType.CompanyTypeDtoNew;
import ru.perminov.tender.dto.companyType.CompanyTypeDtoUpdate;
import ru.perminov.tender.mapper.company.CompanyTypeMapper;
import ru.perminov.tender.model.company.CompanyType;
import ru.perminov.tender.repository.company.CompanyTypeRepository;
import ru.perminov.tender.service.AuditLogService;
import ru.perminov.tender.service.company.CompanyTypeService;
import ru.perminov.tender.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import ru.perminov.tender.model.User;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyTypeServiceImpl implements CompanyTypeService {

    private final CompanyTypeRepository companyTypeRepository;
    private final CompanyTypeMapper companyTypeMapper;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    @Transactional
    public CompanyType create(CompanyTypeDtoNew companyTypeDtoNew) {
        if (companyTypeRepository.existsByName(companyTypeDtoNew.name())) {
            throw new RuntimeException("Тип компании с именем '" + companyTypeDtoNew.name() + "' уже существует");
        }

        CompanyType companyType = companyTypeMapper.toCompanyType(companyTypeDtoNew);
        CompanyType saved = companyTypeRepository.save(companyType);
        auditLogService.logSimple(getCurrentUser(), "CREATE_COMPANY_TYPE", "CompanyType", saved.getId().toString(), "Создан тип компании");
        return saved;
    }

    @Override
    @Transactional
    public CompanyType update(UUID id, CompanyTypeDtoUpdate companyTypeDtoUpdate) {
        CompanyType existingCompanyType = getById(id);
        
        if (companyTypeDtoUpdate.name() != null && !companyTypeDtoUpdate.name().equals(existingCompanyType.getName())) {
            if (companyTypeRepository.existsByName(companyTypeDtoUpdate.name())) {
                throw new RuntimeException("Тип компании с именем '" + companyTypeDtoUpdate.name() + "' уже существует");
            }
        }


        companyTypeMapper.updateCompanyTypeFromDto(companyTypeDtoUpdate, existingCompanyType);
        CompanyType updated = companyTypeRepository.save(existingCompanyType);
        auditLogService.logSimple(getCurrentUser(), "UPDATE_COMPANY_TYPE", "CompanyType", updated.getId().toString(), "Обновлен тип компании");
        return updated;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        companyTypeRepository.deleteById(id);
        auditLogService.logSimple(getCurrentUser(), "DELETE_COMPANY_TYPE", "CompanyType", id.toString(), "Удален тип компании");
    }

    @Override
    public CompanyType getById(UUID id) {
        return companyTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тип компании не найден с id: " + id));
    }

    @Override
    public List<CompanyType> getAll() {
        return companyTypeRepository.findAll();
    }
} 