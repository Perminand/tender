package ru.perminov.tender.dto.contract;

import java.time.LocalDate;
import java.util.UUID;

public record ContractsFromAllWinnersDto(
        UUID tenderId,
        String title,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {}


