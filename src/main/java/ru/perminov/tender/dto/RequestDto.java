package ru.perminov.tender.dto;

import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.project.ProjectDto;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import ru.perminov.tender.dto.RequestMaterialDto;
import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.WarehouseDto;

public record RequestDto(
    UUID id,
    CompanyDto organization,
    ProjectDto project,
    LocalDate date,
    String status,
    String requestNumber,
    List<RequestMaterialDto> materials,
    WarehouseDto warehouse
) {
}