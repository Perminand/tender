package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.delivery.DeliveryDto;
import ru.perminov.tender.dto.delivery.DeliveryDtoNew;
import ru.perminov.tender.dto.delivery.DeliveryItemDto;
import ru.perminov.tender.mapper.DeliveryMapper;
import ru.perminov.tender.model.Delivery;
import ru.perminov.tender.model.DeliveryItem;
import ru.perminov.tender.repository.DeliveryItemRepository;
import ru.perminov.tender.repository.DeliveryRepository;
import ru.perminov.tender.service.DeliveryService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryServiceImpl implements DeliveryService {
    private final DeliveryRepository deliveryRepository;
    private final DeliveryItemRepository deliveryItemRepository;
    private final DeliveryMapper deliveryMapper;

    @Override
    public DeliveryDto createDelivery(DeliveryDtoNew deliveryDtoNew) {
        Delivery delivery = deliveryMapper.toEntity(deliveryDtoNew);
        delivery.setStatus(Delivery.DeliveryStatus.PLANNED);
        Delivery saved = deliveryRepository.save(delivery);
        return deliveryMapper.toDto(saved);
    }

    @Override
    public DeliveryDto getDeliveryById(UUID id) {
        return deliveryRepository.findById(id)
                .map(deliveryMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<DeliveryDto> getAllDeliveries() {
        return deliveryMapper.toDtoList(deliveryRepository.findAll());
    }

    @Override
    public List<DeliveryDto> getDeliveriesByStatus(String status) {
        try {
            Delivery.DeliveryStatus deliveryStatus = Delivery.DeliveryStatus.valueOf(status.toUpperCase());
            return deliveryMapper.toDtoList(deliveryRepository.findByStatus(deliveryStatus));
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @Override
    public List<DeliveryDto> getDeliveriesByContract(UUID contractId) {
        return deliveryMapper.toDtoList(deliveryRepository.findByContractId(contractId));
    }

    @Override
    public List<DeliveryDto> getDeliveriesBySupplier(UUID supplierId) {
        return deliveryMapper.toDtoList(deliveryRepository.findBySupplierId(supplierId));
    }

    @Override
    public DeliveryDto updateDelivery(UUID id, DeliveryDtoNew deliveryDtoNew) {
        Optional<Delivery> deliveryOpt = deliveryRepository.findById(id);
        if (deliveryOpt.isEmpty()) return null;
        Delivery delivery = deliveryOpt.get();
        deliveryMapper.updateEntity(delivery, deliveryDtoNew);
        return deliveryMapper.toDto(deliveryRepository.save(delivery));
    }

    @Override
    public void deleteDelivery(UUID id) {
        deliveryRepository.deleteById(id);
    }

    @Override
    public DeliveryDto changeDeliveryStatus(UUID id, String newStatus) {
        Optional<Delivery> deliveryOpt = deliveryRepository.findById(id);
        if (deliveryOpt.isEmpty()) return null;
        Delivery delivery = deliveryOpt.get();
        try {
            Delivery.DeliveryStatus status = Delivery.DeliveryStatus.valueOf(newStatus.toUpperCase());
            delivery.setStatus(status);
            return deliveryMapper.toDto(deliveryRepository.save(delivery));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Override
    public List<DeliveryItemDto> getDeliveryItems(UUID deliveryId) {
        List<DeliveryItem> items = deliveryItemRepository.findByDeliveryId(deliveryId);
        return items.stream().map(item -> {
            DeliveryItemDto dto = new DeliveryItemDto();
            dto.setId(item.getId());
            dto.setDeliveryId(deliveryId);
            dto.setMaterialId(item.getMaterial() != null ? item.getMaterial().getId() : null);
            dto.setMaterialName(item.getMaterial() != null ? item.getMaterial().getName() : "");
            dto.setQuantity(item.getDeliveredQuantity());
            dto.setUnitName(item.getUnit() != null ? item.getUnit().getName() : "");
            dto.setUnitPrice(item.getUnitPrice());
            dto.setTotalPrice(item.getTotalPrice());
            dto.setQualityStatus(item.getAcceptanceStatus().name());
            dto.setNotes(item.getQualityNotes());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public DeliveryDto confirmDelivery(UUID id) {
        Optional<Delivery> deliveryOpt = deliveryRepository.findById(id);
        if (deliveryOpt.isEmpty()) return null;
        Delivery delivery = deliveryOpt.get();
        delivery.setStatus(Delivery.DeliveryStatus.ACCEPTED);
        delivery.setActualDate(LocalDate.now());
        return deliveryMapper.toDto(deliveryRepository.save(delivery));
    }

    @Override
    public DeliveryDto rejectDelivery(UUID id, String reason) {
        Optional<Delivery> deliveryOpt = deliveryRepository.findById(id);
        if (deliveryOpt.isEmpty()) return null;
        Delivery delivery = deliveryOpt.get();
        delivery.setStatus(Delivery.DeliveryStatus.REJECTED);
        delivery.setNotes(reason);
        return deliveryMapper.toDto(deliveryRepository.save(delivery));
    }
} 