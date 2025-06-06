package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.typecompany.TypeCompanyDtoNew;
import ru.perminov.tender.dto.typecompany.TypeCompanyDtoUpdate;
import ru.perminov.tender.mapper.TypeCompanyMapper;
import ru.perminov.tender.model.TypeCompany;
import ru.perminov.tender.repository.TypeCompanyRepository;
import ru.perminov.tender.service.TypeCompanyService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TypeCompanyServiceImpl implements TypeCompanyService {

    private final TypeCompanyRepository typeCompanyRepository;
    private final TypeCompanyMapper typeCompanyMapper;

    @Override
    @Transactional
    public TypeCompany create(TypeCompanyDtoNew typeCompanyDtoNew) {
        if (typeCompanyRepository.existsByName(typeCompanyDtoNew.name())) {
            throw new RuntimeException("Тип компании с именем '" + typeCompanyDtoNew.name() + "' уже существует");
        }
        TypeCompany typeCompany = typeCompanyMapper.toTypeCompany(typeCompanyDtoNew);
        return typeCompanyRepository.save(typeCompany);
    }

    @Override
    @Transactional
    public TypeCompany update(UUID id, TypeCompanyDtoUpdate typeCompanyDtoUpdate) {
        TypeCompany existingTypeCompany = getById(id);
        typeCompanyMapper.updateTypeCompanyFromDto(typeCompanyDtoUpdate, existingTypeCompany);
        return typeCompanyRepository.save(existingTypeCompany);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        typeCompanyRepository.deleteById(id);
    }

    @Override
    public TypeCompany getById(UUID id) {
        return typeCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тип компании не найден с id: " + id));
    }

    @Override
    public List<TypeCompany> getAll() {
        return typeCompanyRepository.findAll();
    }
} 