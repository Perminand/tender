package ru.perminov.tender.dto.order;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrderDtoNew(

        @NotNull
        @Positive
        Integer number,

        @NotNull
        LocalDate date,

        @NotNull
        UUID companyId,

        @NotNull
        UUID projectId,

        List<UUID> materialIds
) {

}
