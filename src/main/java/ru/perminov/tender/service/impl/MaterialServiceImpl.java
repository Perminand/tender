package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
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

    @Override
    @Transactional
    public Material create(MaterialDtoNew materialDtoNew) {
        if (materialRepository.existsByName(materialDtoNew.name())) {
            throw new RuntimeException("Материал с именем '" + materialDtoNew.name() + "' уже существует");
        }
        Material material = new Material();
        material.setName(materialDtoNew.name());
        material.setDescription(materialDtoNew.description());
        material.setLink(materialDtoNew.link());
        material.setCode(materialDtoNew.code());

        updateRelations(material, materialDtoNew.categoryId(), materialDtoNew.materialTypeId(), materialDtoNew.unitIds());

        return materialRepository.save(material);
    }

    @Override
    @Transactional
    public Material update(UUID id, MaterialDtoUpdate materialDtoUpdate) {
        Material existingMaterial = getById(id);
        existingMaterial.setName(materialDtoUpdate.name());
        existingMaterial.setDescription(materialDtoUpdate.description());
        existingMaterial.setLink(materialDtoUpdate.link());
        existingMaterial.setCode(materialDtoUpdate.code());

        updateRelations(existingMaterial, materialDtoUpdate.categoryId(), materialDtoUpdate.materialTypeId(), materialDtoUpdate.unitIds());

        return materialRepository.save(existingMaterial);
    }

    private void updateRelations(Material material, UUID categoryId, UUID materialTypeId, List<UUID> unitIds) {
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
        materialRepository.deleteById(id);
    }

    @Override
    public Material getById(UUID id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
    }

    @Override
    public List<Material> getAll() {
        return materialRepository.findAll();
    }
} 