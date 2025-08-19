package ru.perminov.tender.service;

import ru.perminov.tender.dto.DeliveryConditionDto;
import ru.perminov.tender.dto.EnumOptionDto;

import java.util.List;
import java.util.UUID;

public interface DeliveryConditionService {

    DeliveryConditionDto createDeliveryCondition(DeliveryConditionDto deliveryConditionDto);

    DeliveryConditionDto updateDeliveryCondition(UUID id, DeliveryConditionDto deliveryConditionDto);

    DeliveryConditionDto getDeliveryCondition(UUID id);

    List<DeliveryConditionDto> getAllDeliveryConditions();

    void deleteDeliveryCondition(UUID id);

    DeliveryConditionDto createDefaultDeliveryCondition(String name, String description);

    List<EnumOptionDto> getAvailableDeliveryTypes();
}
