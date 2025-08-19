package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.DeliveryConditionDto;
import ru.perminov.tender.dto.EnumOptionDto;
import ru.perminov.tender.model.DeliveryCondition;
import ru.perminov.tender.repository.DeliveryConditionRepository;
import ru.perminov.tender.service.DeliveryConditionService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryConditionServiceImpl implements DeliveryConditionService {

    private final DeliveryConditionRepository deliveryConditionRepository;

    @Override
    public DeliveryConditionDto createDeliveryCondition(DeliveryConditionDto deliveryConditionDto) {
        log.info("Создание условий доставки: {}", deliveryConditionDto.getName());
        
        DeliveryCondition deliveryCondition = new DeliveryCondition();
        deliveryCondition.setName(deliveryConditionDto.getName());
        deliveryCondition.setDescription(deliveryConditionDto.getDescription());
        deliveryCondition.setDeliveryType(deliveryConditionDto.getDeliveryType());
        deliveryCondition.setDeliveryCost(deliveryConditionDto.getDeliveryCost());
        deliveryCondition.setDeliveryAddress(deliveryConditionDto.getDeliveryAddress());
        deliveryCondition.setDeliveryPeriod(deliveryConditionDto.getDeliveryPeriod());
        deliveryCondition.setDeliveryResponsibility(deliveryConditionDto.getDeliveryResponsibility());
        deliveryCondition.setAdditionalTerms(deliveryConditionDto.getAdditionalTerms());
        deliveryCondition.setCalculateDelivery(Boolean.TRUE.equals(deliveryConditionDto.getCalculateDelivery()));
        
        DeliveryCondition savedCondition = deliveryConditionRepository.save(deliveryCondition);
        return convertToDto(savedCondition);
    }

    @Override
    public DeliveryConditionDto updateDeliveryCondition(UUID id, DeliveryConditionDto deliveryConditionDto) {
        log.info("Обновление условий доставки с id: {}", id);
        
        DeliveryCondition existingCondition = deliveryConditionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Условия доставки не найдены"));
        
        existingCondition.setName(deliveryConditionDto.getName());
        existingCondition.setDescription(deliveryConditionDto.getDescription());
        existingCondition.setDeliveryType(deliveryConditionDto.getDeliveryType());
        existingCondition.setDeliveryCost(deliveryConditionDto.getDeliveryCost());
        existingCondition.setDeliveryAddress(deliveryConditionDto.getDeliveryAddress());
        existingCondition.setDeliveryPeriod(deliveryConditionDto.getDeliveryPeriod());
        existingCondition.setDeliveryResponsibility(deliveryConditionDto.getDeliveryResponsibility());
        existingCondition.setAdditionalTerms(deliveryConditionDto.getAdditionalTerms());
        existingCondition.setCalculateDelivery(Boolean.TRUE.equals(deliveryConditionDto.getCalculateDelivery()));
        
        DeliveryCondition savedCondition = deliveryConditionRepository.save(existingCondition);
        return convertToDto(savedCondition);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryConditionDto getDeliveryCondition(UUID id) {
        log.info("Получение условий доставки с id: {}", id);
        
        DeliveryCondition deliveryCondition = deliveryConditionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Условия доставки не найдены"));
        
        return convertToDto(deliveryCondition);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryConditionDto> getAllDeliveryConditions() {
        log.info("Получение всех условий доставки");
        
        return deliveryConditionRepository.findAll().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteDeliveryCondition(UUID id) {
        log.info("Удаление условий доставки с id: {}", id);
        
        if (!deliveryConditionRepository.existsById(id)) {
            throw new RuntimeException("Условия доставки не найдены");
        }
        
        deliveryConditionRepository.deleteById(id);
    }

    @Override
    public DeliveryConditionDto createDefaultDeliveryCondition(String name, String description) {
        log.info("Создание стандартных условий доставки: {}", name);
        
        DeliveryConditionDto dto = new DeliveryConditionDto();
        dto.setName(name);
        dto.setDescription(description);
        dto.setDeliveryType(DeliveryCondition.DeliveryType.DELIVERY_TO_WAREHOUSE);
        dto.setDeliveryResponsibility(DeliveryCondition.DeliveryResponsibility.SUPPLIER);
        dto.setDeliveryPeriod("30 дней");
        
        return createDeliveryCondition(dto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnumOptionDto> getAvailableDeliveryTypes() {
        // Берем уникальные типы из таблицы delivery_conditions; если таблица пуста, вернем все значения енума
        List<DeliveryCondition.DeliveryType> distinct = deliveryConditionRepository.findDistinctDeliveryTypes();
        List<DeliveryCondition.DeliveryType> source = (distinct != null && !distinct.isEmpty())
                ? distinct
                : List.of(DeliveryCondition.DeliveryType.values());
        return source.stream()
                .map(t -> new EnumOptionDto(t.name(), t.getDisplayName()))
                .collect(Collectors.toList());
    }

    private DeliveryConditionDto convertToDto(DeliveryCondition deliveryCondition) {
        DeliveryConditionDto dto = new DeliveryConditionDto();
        dto.setId(deliveryCondition.getId());
        dto.setName(deliveryCondition.getName());
        dto.setDescription(deliveryCondition.getDescription());
        dto.setDeliveryType(deliveryCondition.getDeliveryType());
        dto.setDeliveryCost(deliveryCondition.getDeliveryCost());
        dto.setDeliveryAddress(deliveryCondition.getDeliveryAddress());
        dto.setDeliveryPeriod(deliveryCondition.getDeliveryPeriod());
        dto.setDeliveryResponsibility(deliveryCondition.getDeliveryResponsibility());
        dto.setAdditionalTerms(deliveryCondition.getAdditionalTerms());
        dto.setCalculateDelivery(deliveryCondition.isCalculateDelivery());
        return dto;
    }
}
