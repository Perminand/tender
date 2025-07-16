package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.payment.PaymentDto;
import ru.perminov.tender.dto.payment.PaymentDtoNew;
import ru.perminov.tender.mapper.PaymentMapper;
import ru.perminov.tender.model.Payment;
import ru.perminov.tender.model.Delivery;
import ru.perminov.tender.model.DeliveryItem;
import ru.perminov.tender.repository.PaymentRepository;
import ru.perminov.tender.repository.ContractRepository;
import ru.perminov.tender.repository.DeliveryRepository;
import ru.perminov.tender.service.PaymentService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final ContractRepository contractRepository;
    private final DeliveryRepository deliveryRepository;

    /**
     * Рассчитать дату через указанное количество рабочих дней
     */
    private LocalDate calculateDueDate(LocalDate startDate, int workingDays) {
        LocalDate dueDate = startDate;
        int addedDays = 0;
        
        while (addedDays < workingDays) {
            dueDate = dueDate.plusDays(1);
            // Пропускаем выходные (суббота и воскресенье)
            if (dueDate.getDayOfWeek() != DayOfWeek.SATURDAY && dueDate.getDayOfWeek() != DayOfWeek.SUNDAY) {
                addedDays++;
            }
        }
        
        return dueDate;
    }

    @Override
    public PaymentDto createPayment(PaymentDtoNew paymentDtoNew) {
        Payment payment = paymentMapper.toEntity(paymentDtoNew);
        // Устанавливаем contract, если передан contractId
        if (paymentDtoNew.getContractId() != null) {
            contractRepository.findById(paymentDtoNew.getContractId())
                .ifPresent(payment::setContract);
        }
        // Устанавливаем delivery, если передан deliveryId
        if (paymentDtoNew.getDeliveryId() != null) {
            deliveryRepository.findById(paymentDtoNew.getDeliveryId())
                .ifPresent(payment::setDelivery);
        }
        
        // Если срок оплаты не указан и платеж создается из контракта, устанавливаем 5 рабочих дней
        if (payment.getDueDate() == null && paymentDtoNew.getContractId() != null && paymentDtoNew.getDeliveryId() == null) {
            LocalDate startDate = LocalDate.now();
            payment.setDueDate(calculateDueDate(startDate, 5));
        }
        
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);
        return paymentMapper.toDto(saved);
    }

    @Override
    public PaymentDto getPaymentById(UUID id) {
        return paymentRepository.findById(id)
                .map(paymentMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<PaymentDto> getAllPayments() {
        return paymentMapper.toDtoList(paymentRepository.findAll());
    }

    @Override
    public List<PaymentDto> getPaymentsByStatus(String status) {
        try {
            Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
            return paymentMapper.toDtoList(paymentRepository.findByStatus(paymentStatus));
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @Override
    public List<PaymentDto> getPaymentsByContract(UUID contractId) {
        return paymentMapper.toDtoList(paymentRepository.findByContractId(contractId));
    }

    @Override
    public List<PaymentDto> getPaymentsBySupplier(UUID supplierId) {
        return paymentMapper.toDtoList(paymentRepository.findBySupplierId(supplierId));
    }

    @Override
    public PaymentDto updatePayment(UUID id, PaymentDtoNew paymentDtoNew) {
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (paymentOpt.isEmpty()) return null;
        Payment payment = paymentOpt.get();
        
        // Обновляем основные поля
        paymentMapper.updateEntity(payment, paymentDtoNew);
        
        // Если статус изменился на PAID, устанавливаем дату оплаты
        if (paymentDtoNew.getStatus() != null && 
            Payment.PaymentStatus.valueOf(paymentDtoNew.getStatus()) == Payment.PaymentStatus.PAID &&
            payment.getPaidDate() == null) {
            payment.setPaidDate(LocalDate.now());
        }
        
        payment.setUpdatedAt(LocalDateTime.now());
        return paymentMapper.toDto(paymentRepository.save(payment));
    }

    @Override
    public void deletePayment(UUID id) {
        paymentRepository.deleteById(id);
    }

    @Override
    public PaymentDto changePaymentStatus(UUID id, String newStatus) {
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (paymentOpt.isEmpty()) return null;
        Payment payment = paymentOpt.get();
        try {
            Payment.PaymentStatus status = Payment.PaymentStatus.valueOf(newStatus.toUpperCase());
            payment.setStatus(status);
            payment.setUpdatedAt(LocalDateTime.now());
            return paymentMapper.toDto(paymentRepository.save(payment));
        } catch (IllegalArgumentException e) {
            // Логируем ошибку и возвращаем null если статус неверный
            return null;
        }
    }

    @Override
    public PaymentDto confirmPayment(UUID id) {
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (paymentOpt.isEmpty()) return null;
        Payment payment = paymentOpt.get();
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidDate(LocalDate.now());
        payment.setUpdatedAt(LocalDateTime.now());
        return paymentMapper.toDto(paymentRepository.save(payment));
    }

    @Override
    public BigDecimal getContractDebt(UUID contractId) {
        BigDecimal pending = paymentRepository.getTotalPendingAmountByContract(contractId);
        return pending != null ? pending : BigDecimal.ZERO;
    }

    @Override
    public List<PaymentDto> getOverduePayments() {
        return paymentMapper.toDtoList(paymentRepository.findOverduePayments(LocalDateTime.now()));
    }

    @Override
    public List<PaymentDto> createPaymentsFromDeliveries(UUID contractId) {
        // TODO: реализовать создание платежей на основе поставок
        return List.of();
    }

    @Override
    public PaymentDto createPaymentFromDelivery(Delivery delivery) {
        if (delivery == null || delivery.getId() == null) return null;
        if (paymentRepository.existsByDeliveryId(delivery.getId())) return null;
        // Сумма = сумма по всем позициям (не только принятым)
        BigDecimal total = BigDecimal.ZERO;
        if (delivery.getDeliveryItems() != null) {
            for (DeliveryItem item : delivery.getDeliveryItems()) {
                if (item.getOrderedQuantity() != null && item.getUnitPrice() != null) {
                    total = total.add(item.getOrderedQuantity().multiply(item.getUnitPrice()));
                }
            }
        }
        if (total.compareTo(BigDecimal.ZERO) <= 0) return null;
        Payment payment = new Payment();
        payment.setContract(delivery.getContract());
        payment.setSupplier(delivery.getSupplier());
        payment.setDelivery(delivery);
        payment.setAmount(total);
        payment.setDueDate(java.time.LocalDate.now());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setCreatedAt(java.time.LocalDateTime.now());
        payment.setUpdatedAt(java.time.LocalDateTime.now());
        payment.setDescription("Платеж по поставке " + delivery.getDeliveryNumber());
        payment.setType(Payment.PaymentType.PROGRESS);
        Payment saved = paymentRepository.save(payment);
        return paymentMapper.toDto(saved);
    }

    @Override
    public List<PaymentDto> getPaymentsByDelivery(UUID deliveryId) {
        return paymentRepository.findAllByDeliveryId(deliveryId)
                .stream()
                .map(paymentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getStatusStats() {
        Map<String, Long> stats = new java.util.LinkedHashMap<>();
        for (Payment.PaymentStatus status : Payment.PaymentStatus.values()) {
            stats.put(status.name(), paymentRepository.countByStatus(status));
        }
        return stats;
    }
} 