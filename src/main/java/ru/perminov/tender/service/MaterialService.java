package ru.perminov.tender.service;

import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.model.Material;

import java.util.List;
import java.util.UUID;

public interface MaterialService {

    MaterialDto create(MaterialDtoNew materialDtoNew);

    MaterialDto update(UUID id, MaterialDtoUpdate materialDtoUpdate);

    void delete(UUID id);

    MaterialDto getById(UUID id);

    List<MaterialDto> getAll();

} 