package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.payment.PaymentDto;
import ru.perminov.tender.dto.payment.PaymentDtoNew;
import ru.perminov.tender.mapper.PaymentMapper;
import ru.perminov.tender.model.Payment;
import ru.perminov.tender.repository.PaymentRepository;
import ru.perminov.tender.service.PaymentService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public PaymentDto createPayment(PaymentDtoNew paymentDtoNew) {
        Payment payment = paymentMapper.toEntity(paymentDtoNew);
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
        paymentMapper.updateEntity(payment, paymentDtoNew);
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
} 