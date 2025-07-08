package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.ImportResultDto;
import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.mapper.MaterialMapper;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.repository.CategoryRepository;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.repository.MaterialTypeRepository;
import ru.perminov.tender.repository.UnitRepository;
import ru.perminov.tender.service.MaterialService;

import java.io.InputStream;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final CategoryRepository categoryRepository;
    private final MaterialTypeRepository materialTypeRepository;
    private final UnitRepository unitRepository;
    private final MaterialMapper materialMapper;

    @Override
    public MaterialDto create(MaterialDtoNew materialDtoNew) {
        if (materialRepository.existsByName(materialDtoNew.name())) {
            throw new RuntimeException("Материал с именем '" + materialDtoNew.name() + "' уже существует");
        }
        Material material = materialMapper.toEntity(materialDtoNew);
        updateRelations(material, materialDtoNew.categoryId(), materialDtoNew.materialTypeId(), materialDtoNew.unitIds());
        Material savedMaterial = materialRepository.save(material);
        return materialMapper.toDto(savedMaterial);
    }

    @Override
    public MaterialDto update(UUID id, MaterialDtoUpdate materialDtoUpdate) {
        Material existingMaterial = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));

        materialMapper.updateEntityFromDto(materialDtoUpdate, existingMaterial);
        updateRelations(existingMaterial, materialDtoUpdate.categoryId(), materialDtoUpdate.materialTypeId(), materialDtoUpdate.unitIds());

        Material updatedMaterial = materialRepository.save(existingMaterial);
        return materialMapper.toDto(updatedMaterial);
    }

    private void updateRelations(Material material, UUID categoryId, UUID materialTypeId, Set<UUID> unitIds) {
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            material.setCategory(category);
        } else {
            material.setCategory(null);
        }

        if (materialTypeId != null) {
            MaterialType materialType = materialTypeRepository.findById(materialTypeId)
                    .orElseThrow(() -> new RuntimeException("MaterialType not found with id: " + materialTypeId));
            material.setMaterialType(materialType);
        } else {
            material.setMaterialType(null);
        }

        if (unitIds != null && !unitIds.isEmpty()) {
            List<Unit> units = unitRepository.findAllById(unitIds);
            if (units.size() != unitIds.size()) {
                throw new RuntimeException("One or more units not found");
            }
            material.setUnits(new HashSet<>(units));
        } else {
            material.setUnits(Collections.emptySet());
        }
    }

    @Override
    public void delete(UUID id) {
        if (!materialRepository.existsById(id)) {
            throw new RuntimeException("Material not found with id: " + id);
        }
        materialRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialDto getById(UUID id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
        return materialMapper.toDto(material);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialDto> getAll() {
        List<MaterialDto> materialDtos = materialRepository.findAll().stream()
                .map(materialMapper::toDto)
                .collect(Collectors.toList());
        log.info("Список материалов в dto: {}, всего: {}", materialDtos, materialDtos.size() );
        return materialDtos;
    }

    @Override
    public ImportResultDto importFromExcel(MultipartFile file) {
        ImportResultDto result = new ImportResultDto();
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skipping header
                Row row = sheet.getRow(i);
                if (row == null) continue;
                try {
                    String name = getCellValueAsString(row.getCell(1));
                    String description = getCellValueAsString(row.getCell(2));
                    String materialTypeName = getCellValueAsString(row.getCell(3));
                    String link = getCellValueAsString(row.getCell(4));
                    String code = getCellValueAsString(row.getCell(5));
                    String categoryName = getCellValueAsString(row.getCell(6));
                    String unitsStr = getCellValueAsString(row.getCell(7));

                    if (name == null || name.isBlank()) {
                        result.addError(i + 1, "Название не может быть пустым.");
                        continue;
                    }
                    if (materialRepository.existsByName(name)) {
                        result.addError(i + 1, "Материал с названием '" + name + "' уже существует.");
                        continue;
                    }

                    Material material = new Material();
                    material.setName(name);
                    material.setDescription(description);
                    material.setLink(link);
                    material.setCode(code);

                    // Тип материала по имени
                    if (materialTypeName != null && !materialTypeName.isBlank()) {
                        MaterialType type = materialTypeRepository.findByName(materialTypeName)
                                .orElse(null);
                        if (type == null) {
                            // создать новый тип
                            type = new MaterialType();
                            type.setName(materialTypeName);
                            type = materialTypeRepository.save(type);
                        }
                        material.setMaterialType(type);
                    } else {
                        material.setMaterialType(null);
                    }

                    // Категория по имени
                    if (categoryName != null && !categoryName.isBlank()) {
                        Category category = categoryRepository.findByName(categoryName)
                                .orElse(null);
                        if (category == null) {
                            // создать новую категорию
                            category = new Category();
                            category.setName(categoryName);
                            category = categoryRepository.save(category);
                        }
                        material.setCategory(category);
                    } else {
                        material.setCategory(null);
                    }

                    // Единицы измерения по имени (через запятую)
                    Set<Unit> units = new HashSet<>();
                    if (unitsStr != null && !unitsStr.isBlank()) {
                        String[] unitNames = unitsStr.split(",");
                        for (String unitName : unitNames) {
                            String trimmed = unitName.trim();
                            if (!trimmed.isEmpty()) {
                                Unit unit = unitRepository.findByName(trimmed).orElse(null);
                                if (unit == null) {
                                    // создать новую единицу измерения
                                    unit = new Unit();
                                    unit.setName(trimmed);
                                    unit.setShortName(trimmed);
                                    unit = unitRepository.save(unit);
                                }
                                units.add(unit);
                            }
                        }
                    }
                    material.setUnits(units);

                    materialRepository.save(material);
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