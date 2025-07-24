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
import ru.perminov.tender.model.ContractItem;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.repository.DeliveryItemRepository;
import ru.perminov.tender.repository.DeliveryRepository;
import ru.perminov.tender.repository.ContractItemRepository;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.repository.UnitRepository;
import ru.perminov.tender.service.DeliveryService;
import ru.perminov.tender.model.Contract;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.Warehouse;
import ru.perminov.tender.repository.ContractRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.WarehouseRepository;
import ru.perminov.tender.service.PaymentService;
import ru.perminov.tender.service.AuditLogService;
import ru.perminov.tender.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import ru.perminov.tender.model.User;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryServiceImpl implements DeliveryService {
    private final DeliveryRepository deliveryRepository;
    private final DeliveryItemRepository deliveryItemRepository;
    private final ContractItemRepository contractItemRepository;
    private final MaterialRepository materialRepository;
    private final UnitRepository unitRepository;
    private final DeliveryMapper deliveryMapper;
    private final ContractRepository contractRepository;
    private final CompanyRepository companyRepository;
    private final WarehouseRepository warehouseRepository;
    private final PaymentService paymentService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public DeliveryDto createDelivery(DeliveryDtoNew deliveryDtoNew) {
        Delivery delivery = deliveryMapper.toEntity(deliveryDtoNew);
        delivery.setStatus(Delivery.DeliveryStatus.PLANNED);
        
        // Устанавливаем связи с контрактом, поставщиком и складом
        if (deliveryDtoNew.getContractId() != null) {
            Contract contract = contractRepository.findById(deliveryDtoNew.getContractId())
                .orElseThrow(() -> new RuntimeException("Контракт не найден: " + deliveryDtoNew.getContractId()));
            delivery.setContract(contract);
        }
        
        if (deliveryDtoNew.getSupplierId() != null) {
            Company supplier = companyRepository.findById(deliveryDtoNew.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Поставщик не найден: " + deliveryDtoNew.getSupplierId()));
            delivery.setSupplier(supplier);
        }
        
        if (deliveryDtoNew.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(deliveryDtoNew.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Склад не найден: " + deliveryDtoNew.getWarehouseId()));
            delivery.setWarehouse(warehouse);
        }
        
        Delivery saved = deliveryRepository.save(delivery);
        
        // Создаем позиции поставки
        if (deliveryDtoNew.getDeliveryItems() != null && !deliveryDtoNew.getDeliveryItems().isEmpty()) {
            for (DeliveryItemDto itemDto : deliveryDtoNew.getDeliveryItems()) {
                if (itemDto.getOrderedQuantity() != null && itemDto.getOrderedQuantity().compareTo(BigDecimal.ZERO) > 0) {
                    DeliveryItem deliveryItem = new DeliveryItem();
                    deliveryItem.setDelivery(saved);
                    
                    // Устанавливаем связь с позицией контракта
                    if (itemDto.getContractItemId() != null) {
                        ContractItem contractItem = contractItemRepository.findById(itemDto.getContractItemId())
                            .orElseThrow(() -> new RuntimeException("Позиция контракта не найдена: " + itemDto.getContractItemId()));
                        deliveryItem.setContractItem(contractItem);
                    }
                    
                    // Устанавливаем материал
                    if (itemDto.getMaterialId() != null) {
                        Material material = materialRepository.findById(itemDto.getMaterialId())
                            .orElseThrow(() -> new RuntimeException("Материал не найден: " + itemDto.getMaterialId()));
                        deliveryItem.setMaterial(material);
                    }
                    
                    // Устанавливаем единицу измерения
                    if (itemDto.getUnitId() != null) {
                        Unit unit = unitRepository.findById(itemDto.getUnitId())
                            .orElseThrow(() -> new RuntimeException("Единица измерения не найдена: " + itemDto.getUnitId()));
                        deliveryItem.setUnit(unit);
                    }
                    
                    deliveryItem.setItemNumber(itemDto.getItemNumber());
                    deliveryItem.setDescription(itemDto.getDescription());
                    deliveryItem.setOrderedQuantity(itemDto.getOrderedQuantity());
                    deliveryItem.setDeliveredQuantity(itemDto.getDeliveredQuantity());
                    deliveryItem.setAcceptedQuantity(itemDto.getAcceptedQuantity());
                    deliveryItem.setRejectedQuantity(itemDto.getRejectedQuantity());
                    deliveryItem.setUnitPrice(itemDto.getUnitPrice());
                    deliveryItem.setTotalPrice(itemDto.getTotalPrice());
                    deliveryItem.setQualityNotes(itemDto.getQualityNotes());
                    deliveryItem.setRejectionReason(itemDto.getRejectionReason());
                    
                    // Устанавливаем статус приемки
                    if (itemDto.getAcceptanceStatus() != null) {
                        try {
                            deliveryItem.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.valueOf(itemDto.getAcceptanceStatus()));
                        } catch (IllegalArgumentException e) {
                            deliveryItem.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.PENDING);
                        }
                    } else {
                        deliveryItem.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.PENDING);
                    }
                    
                    deliveryItemRepository.save(deliveryItem);
                }
            }
        }
        
        DeliveryDto savedDto = deliveryMapper.toDto(saved);
        auditLogService.logSimple(getCurrentUser(), "CREATE_DELIVERY", "Delivery", savedDto.getId().toString(), "Создана поставка");
        return savedDto;
    }

    @Override
    public DeliveryDto getDeliveryById(UUID id) {
        return deliveryRepository.findById(id)
                .map(deliveryMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<DeliveryDto> getAllDeliveries() {
        return deliveryMapper.toDtoList(deliveryRepository.findAllWithRelations());
    }

    @Override
    public Page<DeliveryDto> getDeliveriesWithFilters(int page, int size, String status, String contractId, String supplierId, String dateFrom, String dateTo) {
        Pageable pageable = PageRequest.of(page, size);
        
        Specification<Delivery> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (status != null && !status.isEmpty()) {
                try {
                    Delivery.DeliveryStatus deliveryStatus = Delivery.DeliveryStatus.valueOf(status);
                    predicates.add(criteriaBuilder.equal(root.get("status"), deliveryStatus));
                } catch (IllegalArgumentException e) {
                    // Игнорируем неверный статус
                }
            }
            
            if (contractId != null && !contractId.isEmpty()) {
                try {
                    UUID contractUuid = UUID.fromString(contractId);
                    predicates.add(criteriaBuilder.equal(root.get("contract").get("id"), contractUuid));
                } catch (IllegalArgumentException e) {
                    // Игнорируем неверный UUID
                }
            }
            
            if (supplierId != null && !supplierId.isEmpty()) {
                try {
                    UUID supplierUuid = UUID.fromString(supplierId);
                    predicates.add(criteriaBuilder.equal(root.get("supplier").get("id"), supplierUuid));
                } catch (IllegalArgumentException e) {
                    // Игнорируем неверный UUID
                }
            }
            
            if (dateFrom != null && !dateFrom.isEmpty()) {
                try {
                    LocalDate fromDate = LocalDate.parse(dateFrom);
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("plannedDeliveryDate"), fromDate));
                } catch (Exception e) {
                    // Игнорируем неверную дату
                }
            }
            
            if (dateTo != null && !dateTo.isEmpty()) {
                try {
                    LocalDate toDate = LocalDate.parse(dateTo);
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("plannedDeliveryDate"), toDate));
                } catch (Exception e) {
                    // Игнорируем неверную дату
                }
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return deliveryRepository.findAll(spec, pageable)
                .map(deliveryMapper::toDto);
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
        return deliveryMapper.toDtoList(deliveryRepository.findByContractIdWithItems(contractId));
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
        Delivery saved = deliveryRepository.save(delivery);
        
        // Обновляем позиции поставки
        if (deliveryDtoNew.getDeliveryItems() != null) {
            // Удаляем старые позиции
            deliveryItemRepository.deleteByDeliveryId(id);
            
            // Создаем новые позиции
            for (DeliveryItemDto itemDto : deliveryDtoNew.getDeliveryItems()) {
                if (itemDto.getOrderedQuantity() != null && itemDto.getOrderedQuantity().compareTo(BigDecimal.ZERO) > 0) {
                    DeliveryItem deliveryItem = new DeliveryItem();
                    deliveryItem.setDelivery(saved);
                    
                    // Устанавливаем связь с позицией контракта
                    if (itemDto.getContractItemId() != null) {
                        ContractItem contractItem = contractItemRepository.findById(itemDto.getContractItemId())
                            .orElseThrow(() -> new RuntimeException("Позиция контракта не найдена: " + itemDto.getContractItemId()));
                        deliveryItem.setContractItem(contractItem);
                    }
                    
                    // Устанавливаем материал
                    if (itemDto.getMaterialId() != null) {
                        Material material = materialRepository.findById(itemDto.getMaterialId())
                            .orElseThrow(() -> new RuntimeException("Материал не найден: " + itemDto.getMaterialId()));
                        deliveryItem.setMaterial(material);
                    }
                    
                    // Устанавливаем единицу измерения
                    if (itemDto.getUnitId() != null) {
                        Unit unit = unitRepository.findById(itemDto.getUnitId())
                            .orElseThrow(() -> new RuntimeException("Единица измерения не найдена: " + itemDto.getUnitId()));
                        deliveryItem.setUnit(unit);
                    }
                    
                    deliveryItem.setItemNumber(itemDto.getItemNumber());
                    deliveryItem.setDescription(itemDto.getDescription());
                    deliveryItem.setOrderedQuantity(itemDto.getOrderedQuantity());
                    deliveryItem.setDeliveredQuantity(itemDto.getDeliveredQuantity());
                    deliveryItem.setAcceptedQuantity(itemDto.getAcceptedQuantity());
                    deliveryItem.setRejectedQuantity(itemDto.getRejectedQuantity());
                    deliveryItem.setUnitPrice(itemDto.getUnitPrice());
                    deliveryItem.setTotalPrice(itemDto.getTotalPrice());
                    deliveryItem.setQualityNotes(itemDto.getQualityNotes());
                    deliveryItem.setRejectionReason(itemDto.getRejectionReason());
                    
                    // Устанавливаем статус приемки
                    if (itemDto.getAcceptanceStatus() != null) {
                        try {
                            deliveryItem.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.valueOf(itemDto.getAcceptanceStatus()));
                        } catch (IllegalArgumentException e) {
                            deliveryItem.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.PENDING);
                        }
                    } else {
                        deliveryItem.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.PENDING);
                    }
                    
                    deliveryItemRepository.save(deliveryItem);
                }
            }
        }
        
        DeliveryDto updated = deliveryMapper.toDto(saved);
        auditLogService.logSimple(getCurrentUser(), "UPDATE_DELIVERY", "Delivery", updated.getId().toString(), "Обновлена поставка");
        return updated;
    }

    @Override
    public void deleteDelivery(UUID id) {
        deliveryRepository.deleteById(id);
        auditLogService.logSimple(getCurrentUser(), "DELETE_DELIVERY", "Delivery", id.toString(), "Удалена поставка");
    }

    @Override
    public DeliveryDto changeDeliveryStatus(UUID id, String newStatus, String comment) {
        Optional<Delivery> deliveryOpt = deliveryRepository.findById(id);
        if (deliveryOpt.isEmpty()) return null;
        Delivery delivery = deliveryOpt.get();
        try {
            Delivery.DeliveryStatus status = Delivery.DeliveryStatus.valueOf(newStatus.toUpperCase());
            delivery.setStatus(status);
            
            // Добавляем комментарий к изменению статуса
            if (comment != null && !comment.trim().isEmpty()) {
                String currentNotes = delivery.getNotes() != null ? delivery.getNotes() : "";
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"));
                String statusChangeNote = String.format("[%s] Статус изменен на '%s'. Комментарий: %s", 
                    timestamp, status, comment);
                delivery.setNotes(currentNotes + (currentNotes.isEmpty() ? "" : "\n") + statusChangeNote);
            }
            Delivery saved = deliveryRepository.save(delivery);
            // Если статус приемки — создать платеж
            if (status == Delivery.DeliveryStatus.ACCEPTED || status == Delivery.DeliveryStatus.PARTIALLY_ACCEPTED) {
                paymentService.createPaymentFromDelivery(saved);
            }
            return deliveryMapper.toDto(saved);
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
            dto.setContractItemId(item.getContractItem() != null ? item.getContractItem().getId() : null);
            dto.setMaterialId(item.getMaterial() != null ? item.getMaterial().getId() : null);
            dto.setMaterialName(item.getMaterial() != null ? item.getMaterial().getName() : "");
            dto.setDescription(item.getDescription());
            dto.setItemNumber(item.getItemNumber());
            dto.setOrderedQuantity(item.getOrderedQuantity());
            dto.setDeliveredQuantity(item.getDeliveredQuantity());
            dto.setAcceptedQuantity(item.getAcceptedQuantity());
            dto.setRejectedQuantity(item.getRejectedQuantity());
            dto.setUnitId(item.getUnit() != null ? item.getUnit().getId() : null);
            dto.setUnitName(item.getUnit() != null ? item.getUnit().getName() : "");
            dto.setUnitPrice(item.getUnitPrice());
            dto.setTotalPrice(item.getTotalPrice());
            dto.setQualityNotes(item.getQualityNotes());
            dto.setRejectionReason(item.getRejectionReason());
            dto.setAcceptanceStatus(item.getAcceptanceStatus() != null ? item.getAcceptanceStatus().name() : null);
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

    @Override
    public DeliveryItemDto updateDeliveryItemAcceptance(UUID deliveryId, UUID itemId, DeliveryItemDto acceptanceDto) {
        Optional<DeliveryItem> itemOpt = deliveryItemRepository.findById(itemId);
        if (itemOpt.isEmpty()) return null;
        
        DeliveryItem item = itemOpt.get();
        
        // Проверяем, что позиция принадлежит указанной поставке
        if (!item.getDelivery().getId().equals(deliveryId)) {
            return null;
        }
        
        // Обновляем данные приемки
        if (acceptanceDto.getAcceptedQuantity() != null) {
            item.setAcceptedQuantity(acceptanceDto.getAcceptedQuantity());
        }
        if (acceptanceDto.getRejectedQuantity() != null) {
            item.setRejectedQuantity(acceptanceDto.getRejectedQuantity());
        }
        if (acceptanceDto.getQualityNotes() != null) {
            item.setQualityNotes(acceptanceDto.getQualityNotes());
        }
        if (acceptanceDto.getRejectionReason() != null) {
            item.setRejectionReason(acceptanceDto.getRejectionReason());
        }
        
        // Определяем статус приемки на основе количеств
        BigDecimal accepted = item.getAcceptedQuantity() != null ? item.getAcceptedQuantity() : BigDecimal.ZERO;
        BigDecimal rejected = item.getRejectedQuantity() != null ? item.getRejectedQuantity() : BigDecimal.ZERO;
        BigDecimal ordered = item.getOrderedQuantity() != null ? item.getOrderedQuantity() : BigDecimal.ZERO;
        
        if (accepted.compareTo(BigDecimal.ZERO) > 0 && rejected.compareTo(BigDecimal.ZERO) > 0) {
            item.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.PARTIALLY_ACCEPTED);
        } else if (accepted.compareTo(ordered) >= 0) {
            item.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.ACCEPTED);
        } else if (rejected.compareTo(ordered) >= 0) {
            item.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.REJECTED);
        } else {
            item.setAcceptanceStatus(DeliveryItem.AcceptanceStatus.PENDING);
        }
        
        DeliveryItem savedItem = deliveryItemRepository.save(item);
        
        // Создаем DTO для ответа
        DeliveryItemDto dto = new DeliveryItemDto();
        dto.setId(savedItem.getId());
        dto.setDeliveryId(deliveryId);
        dto.setContractItemId(savedItem.getContractItem() != null ? savedItem.getContractItem().getId() : null);
        dto.setMaterialId(savedItem.getMaterial() != null ? savedItem.getMaterial().getId() : null);
        dto.setMaterialName(savedItem.getMaterial() != null ? savedItem.getMaterial().getName() : "");
        dto.setDescription(savedItem.getDescription());
        dto.setItemNumber(savedItem.getItemNumber());
        dto.setOrderedQuantity(savedItem.getOrderedQuantity());
        dto.setDeliveredQuantity(savedItem.getDeliveredQuantity());
        dto.setAcceptedQuantity(savedItem.getAcceptedQuantity());
        dto.setRejectedQuantity(savedItem.getRejectedQuantity());
        dto.setUnitId(savedItem.getUnit() != null ? savedItem.getUnit().getId() : null);
        dto.setUnitName(savedItem.getUnit() != null ? savedItem.getUnit().getName() : "");
        dto.setUnitPrice(savedItem.getUnitPrice());
        dto.setTotalPrice(savedItem.getTotalPrice());
        dto.setQualityNotes(savedItem.getQualityNotes());
        dto.setRejectionReason(savedItem.getRejectionReason());
        dto.setAcceptanceStatus(savedItem.getAcceptanceStatus() != null ? savedItem.getAcceptanceStatus().name() : null);
        
        return dto;
    }

    @Override
    public Map<String, Long> getStatusStats() {
        Map<String, Long> stats = new java.util.LinkedHashMap<>();
        for (Delivery.DeliveryStatus status : Delivery.DeliveryStatus.values()) {
            stats.put(status.name(), deliveryRepository.countByStatus(status));
        }
        return stats;
    }
} 