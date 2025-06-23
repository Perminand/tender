package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final CategoryRepository categoryRepository;
    private final MaterialTypeRepository materialTypeRepository;
    private final UnitRepository unitRepository;
    private final MaterialMapper materialMapper;

    @Override
    @Transactional
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
    @Transactional
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
    @Transactional
    public void delete(UUID id) {
        if (!materialRepository.existsById(id)) {
            throw new RuntimeException("Material not found with id: " + id);
        }
        materialRepository.deleteById(id);
    }

    @Override
    public MaterialDto getById(UUID id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
        return materialMapper.toDto(material);
    }

    @Override
    public List<MaterialDto> getAll() {
        return materialRepository.findAll().stream()
                .map(materialMapper::toDto)
                .collect(Collectors.toList());
    }
} 