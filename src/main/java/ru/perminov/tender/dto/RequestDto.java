package ru.perminov.tender.dto;

import lombok.NoArgsConstructor;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.project.ProjectDto;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record RequestDto(

    UUID id,

    CompanyDto organization,

    ProjectDto project,

    LocalDate date,

    String requestNumber,

    List<RequestMaterialDto> requestMaterials,

    WarehouseDto warehouse,

    String applicant,

    String executor,

    String status

) {
}