package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class PaymentConditionDto {

    private UUID id;

    @NotBlank(message = "Название условий оплаты обязательно для заполнения")
    @Size(max = 255, message = "Название не может превышать 255 символов")
    private String name;

    @Size(max = 1000, message = "Описание не может превышать 1000 символов")
    private String description;

    @NotNull(message = "Части платежа обязательны для заполнения")
    private List<PaymentPartDto> paymentParts;
}
