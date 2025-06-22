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
} 