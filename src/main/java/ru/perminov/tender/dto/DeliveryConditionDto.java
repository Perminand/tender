package ru.perminov.tender.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.perminov.tender.model.DeliveryCondition;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DeliveryConditionDto {

    private UUID id;

    @NotBlank(message = "Название условий доставки обязательно для заполнения")
    @Size(max = 255, message = "Название не может превышать 255 символов")
    private String name;

    @Size(max = 1000, message = "Описание не может превышать 1000 символов")
    private String description;

    @NotNull(message = "Тип доставки обязателен для заполнения")
    private DeliveryCondition.DeliveryType deliveryType;

    @Positive(message = "Стоимость доставки должна быть больше 0")
    private BigDecimal deliveryCost;

    @Size(max = 500, message = "Адрес доставки не может превышать 500 символов")
    private String deliveryAddress;

    @Size(max = 255, message = "Срок доставки не может превышать 255 символов")
    private String deliveryPeriod;

    @NotNull(message = "Ответственность за доставку обязательна для заполнения")
    private DeliveryCondition.DeliveryResponsibility deliveryResponsibility;

    @Size(max = 1000, message = "Дополнительные условия не могут превышать 1000 символов")
    private String additionalTerms;
}
