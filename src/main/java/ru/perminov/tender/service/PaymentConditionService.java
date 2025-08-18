package ru.perminov.tender.service;

import ru.perminov.tender.dto.PaymentConditionDto;

import java.util.List;
import java.util.UUID;

public interface PaymentConditionService {

    PaymentConditionDto createPaymentCondition(PaymentConditionDto paymentConditionDto);

    PaymentConditionDto updatePaymentCondition(UUID id, PaymentConditionDto paymentConditionDto);

    PaymentConditionDto getPaymentCondition(UUID id);

    List<PaymentConditionDto> getAllPaymentConditions();

    void deletePaymentCondition(UUID id);

    PaymentConditionDto createDefaultPaymentCondition(String name, String description);
}
