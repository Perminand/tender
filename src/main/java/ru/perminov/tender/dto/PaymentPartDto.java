package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.perminov.tender.model.PaymentPart;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentPartDto {

    private UUID id;

    @NotBlank(message = "Название части платежа обязательно для заполнения")
    @Size(max = 255, message = "Название не может превышать 255 символов")
    private String name;

    @NotNull(message = "Тип платежа обязателен для заполнения")
    private PaymentPart.PaymentType paymentType;

    @NotNull(message = "Сумма обязательна для заполнения")
    @Positive(message = "Сумма должна быть больше 0")
    private BigDecimal amount;

    @NotNull(message = "Момент оплаты обязателен для заполнения")
    private PaymentPart.PaymentMoment paymentMoment;

    @Size(max = 500, message = "Описание не может превышать 500 символов")
    private String description;

    @NotNull(message = "Порядковый номер обязателен для заполнения")
    private Integer orderIndex;
}
