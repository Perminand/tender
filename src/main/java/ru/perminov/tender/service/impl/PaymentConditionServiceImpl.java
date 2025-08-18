package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.PaymentConditionDto;
import ru.perminov.tender.dto.PaymentPartDto;
import ru.perminov.tender.model.PaymentCondition;
import ru.perminov.tender.model.PaymentPart;
import ru.perminov.tender.repository.PaymentConditionRepository;
import ru.perminov.tender.service.PaymentConditionService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentConditionServiceImpl implements PaymentConditionService {

    private final PaymentConditionRepository paymentConditionRepository;

    @Override
    public PaymentConditionDto createPaymentCondition(PaymentConditionDto paymentConditionDto) {
        log.info("Создание условий оплаты: {}", paymentConditionDto.getName());
        
        PaymentCondition paymentCondition = new PaymentCondition();
        paymentCondition.setName(paymentConditionDto.getName());
        paymentCondition.setDescription(paymentConditionDto.getDescription());
        
        // Сохраняем основную сущность
        PaymentCondition savedCondition = paymentConditionRepository.save(paymentCondition);
        
        // Сохраняем части платежа
        if (paymentConditionDto.getPaymentParts() != null) {
            List<PaymentPart> paymentParts = paymentConditionDto.getPaymentParts().stream()
                .map(partDto -> {
                    PaymentPart part = new PaymentPart();
                    part.setPaymentCondition(savedCondition);
                    part.setName(partDto.getName());
                    part.setPaymentType(partDto.getPaymentType());
                    part.setAmount(partDto.getAmount());
                    part.setPaymentMoment(partDto.getPaymentMoment());
                    part.setDescription(partDto.getDescription());
                    part.setOrderIndex(partDto.getOrderIndex());
                    return part;
                })
                .collect(Collectors.toList());
            
            savedCondition.setPaymentParts(paymentParts);
        }
        
        return convertToDto(savedCondition);
    }

    @Override
    public PaymentConditionDto updatePaymentCondition(UUID id, PaymentConditionDto paymentConditionDto) {
        log.info("Обновление условий оплаты с id: {}", id);
        
        PaymentCondition existingCondition = paymentConditionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Условия оплаты не найдены"));
        
        existingCondition.setName(paymentConditionDto.getName());
        existingCondition.setDescription(paymentConditionDto.getDescription());
        
        // Обновляем части платежа
        if (paymentConditionDto.getPaymentParts() != null) {
            // Удаляем старые части
            existingCondition.getPaymentParts().clear();
            
            // Добавляем новые части
            List<PaymentPart> paymentParts = paymentConditionDto.getPaymentParts().stream()
                .map(partDto -> {
                    PaymentPart part = new PaymentPart();
                    part.setPaymentCondition(existingCondition);
                    part.setName(partDto.getName());
                    part.setPaymentType(partDto.getPaymentType());
                    part.setAmount(partDto.getAmount());
                    part.setPaymentMoment(partDto.getPaymentMoment());
                    part.setDescription(partDto.getDescription());
                    part.setOrderIndex(partDto.getOrderIndex());
                    return part;
                })
                .collect(Collectors.toList());
            
            existingCondition.setPaymentParts(paymentParts);
        }
        
        PaymentCondition savedCondition = paymentConditionRepository.save(existingCondition);
        return convertToDto(savedCondition);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentConditionDto getPaymentCondition(UUID id) {
        log.info("Получение условий оплаты с id: {}", id);
        
        PaymentCondition paymentCondition = paymentConditionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Условия оплаты не найдены"));
        
        return convertToDto(paymentCondition);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentConditionDto> getAllPaymentConditions() {
        log.info("Получение всех условий оплаты");
        
        return paymentConditionRepository.findAll().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @Override
    public void deletePaymentCondition(UUID id) {
        log.info("Удаление условий оплаты с id: {}", id);
        
        if (!paymentConditionRepository.existsById(id)) {
            throw new RuntimeException("Условия оплаты не найдены");
        }
        
        paymentConditionRepository.deleteById(id);
    }

    @Override
    public PaymentConditionDto createDefaultPaymentCondition(String name, String description) {
        log.info("Создание стандартных условий оплаты: {}", name);
        
        PaymentConditionDto dto = new PaymentConditionDto();
        dto.setName(name);
        dto.setDescription(description);
        
        // Создаем стандартную часть платежа - 100% аванс
        PaymentPartDto partDto = new PaymentPartDto();
        partDto.setName("Аванс");
        partDto.setPaymentType(PaymentPart.PaymentType.PERCENTAGE);
        partDto.setAmount(BigDecimal.valueOf(100));
        partDto.setPaymentMoment(PaymentPart.PaymentMoment.ADVANCE);
        partDto.setDescription("100% предоплата");
        partDto.setOrderIndex(1);
        
        dto.setPaymentParts(List.of(partDto));
        
        return createPaymentCondition(dto);
    }

    private PaymentConditionDto convertToDto(PaymentCondition paymentCondition) {
        PaymentConditionDto dto = new PaymentConditionDto();
        dto.setId(paymentCondition.getId());
        dto.setName(paymentCondition.getName());
        dto.setDescription(paymentCondition.getDescription());
        
        if (paymentCondition.getPaymentParts() != null) {
            List<PaymentPartDto> partDtos = paymentCondition.getPaymentParts().stream()
                .map(this::convertPartToDto)
                .collect(Collectors.toList());
            dto.setPaymentParts(partDtos);
        }
        
        return dto;
    }

    private PaymentPartDto convertPartToDto(PaymentPart paymentPart) {
        PaymentPartDto dto = new PaymentPartDto();
        dto.setId(paymentPart.getId());
        dto.setName(paymentPart.getName());
        dto.setPaymentType(paymentPart.getPaymentType());
        dto.setAmount(paymentPart.getAmount());
        dto.setPaymentMoment(paymentPart.getPaymentMoment());
        dto.setDescription(paymentPart.getDescription());
        dto.setOrderIndex(paymentPart.getOrderIndex());
        return dto;
    }
}
