package ru.perminov.tender.dto.order;

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
