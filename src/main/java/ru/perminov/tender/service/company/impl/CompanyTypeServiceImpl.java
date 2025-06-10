package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.typecompany.CompanyTypeDtoNew;
import ru.perminov.tender.dto.typecompany.CompanyTypeDtoUpdate;
import ru.perminov.tender.mapper.company.CompanyTypeMapper;
import ru.perminov.tender.model.company.CompanyType;
import ru.perminov.tender.repository.company.CompanyTypeRepository;
import ru.perminov.tender.service.company.CompanyTypeService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyTypeServiceImpl implements CompanyTypeService {

    private final CompanyTypeRepository companyTypeRepository;
    private final CompanyTypeMapper companyTypeMapper;

    @Override
    @Transactional
    public CompanyType create(CompanyTypeDtoNew companyTypeDtoNew) {
        if (companyTypeRepository.existsByName(companyTypeDtoNew.name())) {
            throw new RuntimeException("Тип компании с именем '" + companyTypeDtoNew.name() + "' уже существует");
        }

        CompanyType companyType = companyTypeMapper.toCompanyType(companyTypeDtoNew);
        return companyTypeRepository.save(companyType);
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
        return companyTypeRepository.save(existingCompanyType);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        companyTypeRepository.deleteById(id);
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