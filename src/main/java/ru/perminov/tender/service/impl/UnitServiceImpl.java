package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.UnitDtoNew;
import ru.perminov.tender.dto.UnitDtoUpdate;
import ru.perminov.tender.mapper.UnitMapper;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.repository.UnitRepository;
import ru.perminov.tender.service.UnitService;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.ImportResultDto;

import java.io.InputStream;
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
                    String shortName = getCellValueAsString(row.getCell(2));

                    if (name == null || name.isBlank()) {
                        result.addError(i + 1, "Название не может быть пустым.");
                        continue;
                    }

                    if (unitRepository.existsByName(name)) {
                        result.addError(i + 1, "Единица измерения с названием '" + name + "' уже существует.");
                        continue;
                    }
                    Unit unit = new Unit();
                    unit.setName(name);
                    unit.setShortName(shortName);
                    unitRepository.save(unit);
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