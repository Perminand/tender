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
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import ru.perminov.tender.dto.ImportResultDto;

import java.io.InputStream;
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
    public ImportResultDto importFromExcel(org.springframework.web.multipart.MultipartFile file) {
        ImportResultDto result = new ImportResultDto();
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skipping header
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    String name = getCellValueAsString(row.getCell(1));

                    if (name == null || name.isBlank()) {
                        result.addError(i + 1, "Название не может быть пустым.");
                        continue;
                    }

                    if (materialTypeRepository.existsByName(name)) {
                        result.addError(i + 1, "Тип материала с названием '" + name + "' уже существует.");
                        continue;
                    }
                    MaterialType materialType = new MaterialType();
                    materialType.setName(name);
                    materialTypeRepository.save(materialType);
                    result.incrementImported();
                } catch (Exception e) {
                    result.addError(i + 1, "Ошибка в строке: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Ошибка импорта файла: " + e.getMessage(), e);
        }
        return result;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            default:
                return null;
        }
    }
} 