package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrderDtoUpdate(

        @Positive
        Integer number,

        LocalDate date,

        UUID companyId,

        UUID projectId,

        List<UUID> materialIds
) {

}
