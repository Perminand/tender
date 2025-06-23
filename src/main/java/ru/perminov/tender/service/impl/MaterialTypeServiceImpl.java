package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.MaterialTypeDtoNew;
import ru.perminov.tender.dto.MaterialTypeDtoUpdate;
import ru.perminov.tender.mapper.MaterialTypeMapper;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.repository.MaterialTypeRepository;
import ru.perminov.tender.service.MaterialTypeService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialTypeServiceImpl implements MaterialTypeService {

    private final MaterialTypeRepository materialTypeRepository;
    private final MaterialTypeMapper materialTypeMapper;

    @Override
    @Transactional
    public MaterialType create(MaterialTypeDtoNew materialTypeDtoNew) {
        if (materialTypeRepository.existsByName(materialTypeDtoNew.name())) {
            throw new RuntimeException("Тип материала с именем '" + materialTypeDtoNew.name() + "' уже существует");
        }
        MaterialType materialType = materialTypeMapper.toMaterialType(materialTypeDtoNew);
        return materialTypeRepository.save(materialType);
    }

    @Override
    @Transactional
    public MaterialType update(UUID id, MaterialTypeDtoUpdate materialTypeDtoUpdate) {
        MaterialType existingMaterialType = getById(id);
        materialTypeMapper.updateMaterialTypeFromDto(materialTypeDtoUpdate, existingMaterialType);
        return materialTypeRepository.save(existingMaterialType);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        materialTypeRepository.deleteById(id);
    }

    @Override
    public MaterialType getById(UUID id) {
        return materialTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MaterialType not found with id: " + id));
    }

    @Override
    public List<MaterialType> getAll() {
        return materialTypeRepository.findAll();
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
                if (materialTypeRepository.existsByName(name)) continue;
                MaterialType materialType = new MaterialType();
                materialType.setName(name);
                materialTypeRepository.save(materialType);
                count++;
            }
            return count;
        } catch (Exception e) {
            throw new RuntimeException("Ошибка импорта: " + e.getMessage(), e);
        }
    }
} 