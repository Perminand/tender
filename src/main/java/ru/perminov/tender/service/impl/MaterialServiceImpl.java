package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.mapper.MaterialMapper;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.service.MaterialService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialMapper materialMapper;

    @Override
    @Transactional
    public Material create(MaterialDtoNew materialDtoNew) {
        if (materialRepository.existsByName(materialDtoNew.name())) {
            throw new RuntimeException("Материал с именем '" + materialDtoNew.name() + "' уже существует");
        }
        Material material = materialMapper.toMaterial(materialDtoNew);
        return materialRepository.save(material);
    }

    @Override
    @Transactional
    public Material update(UUID id, MaterialDtoUpdate materialDtoUpdate) {
        Material existingMaterial = getById(id);
        materialMapper.updateMaterialFromDto(materialDtoUpdate, existingMaterial);
        return materialRepository.save(existingMaterial);
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