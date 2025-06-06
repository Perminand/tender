package ru.perminov.tender.service;

import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.model.Material;

import java.util.List;
import java.util.UUID;

public interface MaterialService {
    Material create(MaterialDtoNew materialDtoNew);
    Material update(UUID id, MaterialDtoUpdate materialDtoUpdate);
    void delete(UUID id);
    Material getById(UUID id);
    List<Material> getAll();
} 