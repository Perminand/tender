package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.UnitDtoNew;
import ru.perminov.tender.dto.UnitDtoUpdate;
import ru.perminov.tender.mapper.UnitMapper;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.repository.UnitRepository;
import ru.perminov.tender.service.UnitService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;

    @Override
    public Unit create(UnitDtoNew unitDtoNew) {
        if (unitRepository.existsByName(unitDtoNew.name())) {
            throw new RuntimeException("Единица измерения с таким названием уже существует");
        }
        Unit unit = unitMapper.toUnit(unitDtoNew);
        return unitRepository.save(unit);
    }

    @Override
    public Unit update(UUID id, UnitDtoUpdate unitDtoUpdate) {
        Unit unit = getById(id);
        unitMapper.updateUnitFromDto(unitDtoUpdate, unit);
        return unitRepository.save(unit);
    }

    @Override
    public void delete(UUID id) {
        if (!unitRepository.existsById(id)) {
            throw new RuntimeException("Единица измерения не найдена");
        }
        unitRepository.deleteById(id);
    }

    @Override
    public Unit getById(UUID id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Единица измерения не найдена"));
    }

    @Override
    public List<Unit> getAll() {
        return unitRepository.findAll();
    }

    @Override
    public int importFromExcel(org.springframework.web.multipart.MultipartFile file) {
        try (java.io.InputStream is = file.getInputStream();
             org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(is)) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            int count = 0;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // пропускаем header
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null) continue;
                String name = row.getCell(1) != null ? row.getCell(1).getStringCellValue() : null;
                String shortName = row.getCell(2) != null ? row.getCell(2).getStringCellValue() : null;
                if (name == null || name.isBlank() || shortName == null || shortName.isBlank()) continue;
                if (unitRepository.existsByName(name)) continue;
                Unit unit = new Unit();
                unit.setName(name);
                unit.setShortName(shortName);
                unitRepository.save(unit);
                count++;
            }
            return count;
        } catch (Exception e) {
            throw new RuntimeException("Ошибка импорта: " + e.getMessage(), e);
        }
    }
} 