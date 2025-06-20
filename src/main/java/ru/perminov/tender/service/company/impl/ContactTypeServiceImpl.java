package ru.perminov.tender.service.company.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoNew;
import ru.perminov.tender.dto.company.contact.ContactTypeDtoUpdate;
import ru.perminov.tender.mapper.company.ContactTypeMapper;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.ContactTypeRepository;
import ru.perminov.tender.service.company.ContactTypeService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactTypeServiceImpl implements ContactTypeService {

    private final ContactTypeRepository contactTypeRepository;
    private final ContactTypeMapper contactTypeMapper;

    @Override
    @Transactional
    public ContactTypeDto create(ContactTypeDtoNew contactTypeDtoNew) {
        if (contactTypeRepository.existsByCode(contactTypeDtoNew.code())) {
            throw new DuplicateKeyException("Тип контакта с кодом '" + contactTypeDtoNew.code() + "' уже существует");
        }

        ContactType contactType = contactTypeMapper.toContactType(contactTypeDtoNew);
        contactType = contactTypeRepository.save(contactType);
        return contactTypeMapper.toContactTypeDto(contactType);
    }

    @Override
    @Transactional
    public ContactTypeDto update(UUID id, ContactTypeDtoUpdate contactTypeDtoUpdate) {
        ContactType existingContactType = contactTypeRepository.findById(id).orElseThrow(
                ()-> new EntityNotFoundException("Тип контакта не найден id: " + id)
        );
        
        if (!contactTypeDtoUpdate.code().equals(existingContactType.getCode()) && 
            contactTypeRepository.existsByCode(contactTypeDtoUpdate.code())) {
            throw new DuplicateKeyException("Тип контакта с кодом '" + contactTypeDtoUpdate.code() + "' уже существует");
        }

        contactTypeMapper.updateContactTypeFromDto(contactTypeDtoUpdate, existingContactType);
        existingContactType = contactTypeRepository.save(existingContactType);
        return contactTypeMapper.toContactTypeDto(existingContactType);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        contactTypeRepository.deleteById(id);
    }

    @Override
    public ContactTypeDto getById(UUID id) {
        ContactType contactType = contactTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тип контакта не найден с id: " + id));
        return contactTypeMapper.toContactTypeDto(contactType);
    }

    @Override
    public List<ContactTypeDto> getAll() {
        return contactTypeRepository.findAll().stream()
                .map(contactTypeMapper::toContactTypeDto)
                .toList();
    }
} 