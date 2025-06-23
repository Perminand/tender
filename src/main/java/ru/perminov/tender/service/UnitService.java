package ru.perminov.tender.service;

import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.UnitDtoNew;
import ru.perminov.tender.dto.UnitDtoUpdate;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.dto.ImportResultDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface UnitService {

    Unit create(UnitDtoNew unitDtoNew);

    Unit update(UUID id, UnitDtoUpdate unitDtoUpdate);

    void delete(UUID id);

    Unit getById(UUID id);

    List<Unit> getAll();

    ImportResultDto importFromExcel(MultipartFile file);

} 