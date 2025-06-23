package ru.perminov.tender.service;

import ru.perminov.tender.dto.MaterialTypeDto;
import ru.perminov.tender.dto.MaterialTypeDtoNew;
import ru.perminov.tender.dto.MaterialTypeDtoUpdate;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.dto.ImportResultDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MaterialTypeService {

    MaterialType create(MaterialTypeDtoNew materialTypeDtoNew);

    MaterialType update(UUID id, MaterialTypeDtoUpdate materialTypeDtoUpdate);

    void delete(UUID id);

    MaterialType getById(UUID id);

    List<MaterialType> getAll();

    ImportResultDto importFromExcel(MultipartFile file);

} 