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
        if (contactTypeRepository.existsByName(contactTypeDtoNew.name())) {
            throw new DuplicateKeyException("Тип контакта с именем '" + contactTypeDtoNew.name() + "' уже существует");
        }

        ContactType contactType = contactTypeMapper.toContactType(contactTypeDtoNew);
        contactType = contactTypeRepository.save(contactType);
        return contactTypeMapper.toContactTypeDto(contactType);
    }

    @Override
    @Transactional
    public ContactTypeDto update(UUID id, ContactTypeDtoUpdate contactTypeDtoUpdate) {
        ContactType contactType = contactTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Тип контакта не найден с id: " + id));

        // Проверяем, что новое имя не конфликтует с существующими (исключая текущий)
        if (!contactType.getName().equals(contactTypeDtoUpdate.name()) && 
            contactTypeRepository.existsByName(contactTypeDtoUpdate.name())) {
            throw new DuplicateKeyException("Тип контакта с именем '" + contactTypeDtoUpdate.name() + "' уже существует");
        }

        contactType.setName(contactTypeDtoUpdate.name());
        contactType = contactTypeRepository.save(contactType);
        return contactTypeMapper.toContactTypeDto(contactType);
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

    @Override
    @Transactional
    public int importFromExcel(org.springframework.web.multipart.MultipartFile file) {
        try (java.io.InputStream is = file.getInputStream();
             org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(is)) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            int count = 0;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // пропускаем header
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null) continue;
                String name = row.getCell(1) != null ? row.getCell(1).getStringCellValue() : null;
                if (name == null || name.isBlank()) continue;
                if (contactTypeRepository.existsByName(name)) continue;
                ContactType contactType = new ContactType();
                contactType.setName(name);
                contactTypeRepository.save(contactType);
                count++;
            }
            return count;
        } catch (Exception e) {
            throw new RuntimeException("Ошибка импорта: " + e.getMessage(), e);
        }
    }
} 