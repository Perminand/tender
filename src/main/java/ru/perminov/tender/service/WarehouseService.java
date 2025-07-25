package ru.perminov.tender.service;

import ru.perminov.tender.dto.WarehouseDto;
import java.util.List;
import java.util.UUID;

public interface WarehouseService {

    List<WarehouseDto> findAll();

    List<WarehouseDto> findByProjectId(UUID projectId);

    WarehouseDto save(WarehouseDto dto);

    void delete(UUID id);

} 