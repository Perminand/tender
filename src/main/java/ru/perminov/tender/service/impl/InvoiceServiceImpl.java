package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.InvoiceDto;
import ru.perminov.tender.dto.InvoiceDtoNew;
import ru.perminov.tender.dto.InvoiceDtoUpdate;
import ru.perminov.tender.dto.InvoiceItemDto;
import ru.perminov.tender.dto.InvoiceItemDtoNew;
import ru.perminov.tender.exception.ResourceNotFoundException;
import ru.perminov.tender.model.*;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.*;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.InvoiceService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final CompanyRepository companyRepository;
    private final RequestRepository requestRepository;
    private final MaterialRepository materialRepository;
    private final UnitRepository unitRepository;

    @Override
    public InvoiceDto createInvoice(InvoiceDtoNew invoiceDtoNew) {
        log.info("Создание нового счета от поставщика: {}", invoiceDtoNew);
        
        // Проверяем существование связанных сущностей
        Contract contract = null;
        if (invoiceDtoNew.getContractId() != null) {
            contract = contractRepository.findById(invoiceDtoNew.getContractId())
                    .orElseThrow(() -> new ResourceNotFoundException("Контракт не найден: " + invoiceDtoNew.getContractId()));
        }
        
        Company supplier = companyRepository.findById(invoiceDtoNew.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Поставщик не найден: " + invoiceDtoNew.getSupplierId()));
        
        Request request = null;
        if (invoiceDtoNew.getRequestId() != null) {
            request = requestRepository.findById(invoiceDtoNew.getRequestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Заявка не найдена: " + invoiceDtoNew.getRequestId()));
        }
        
        // Создаем счет
        Invoice invoice = new Invoice();
        invoice.setContract(contract);
        invoice.setSupplier(supplier);
        invoice.setRequest(request);
        invoice.setInvoiceNumber(invoiceDtoNew.getInvoiceNumber());
        invoice.setInvoiceDate(invoiceDtoNew.getInvoiceDate());
        invoice.setDueDate(invoiceDtoNew.getDueDate());
        invoice.setTotalAmount(invoiceDtoNew.getTotalAmount());
        invoice.setVatAmount(invoiceDtoNew.getVatAmount());
        invoice.setCurrency(invoiceDtoNew.getCurrency() != null ? invoiceDtoNew.getCurrency() : "RUB");
        invoice.setPaymentTerms(invoiceDtoNew.getPaymentTerms());
        invoice.setNotes(invoiceDtoNew.getNotes());
        invoice.setStatus(Invoice.InvoiceStatus.DRAFT);
        invoice.setPaidAmount(BigDecimal.ZERO);
        
        // Сохраняем счет
        invoice = invoiceRepository.save(invoice);
        
        // Создаем элементы счета
        if (invoiceDtoNew.getInvoiceItems() != null) {
            for (InvoiceItemDtoNew itemDto : invoiceDtoNew.getInvoiceItems()) {
                InvoiceItem item = new InvoiceItem();
                item.setInvoice(invoice);
                
                if (itemDto.getMaterialId() != null) {
                    Material material = materialRepository.findById(itemDto.getMaterialId())
                            .orElseThrow(() -> new ResourceNotFoundException("Материал не найден: " + itemDto.getMaterialId()));
                    item.setMaterial(material);
                }
                
                item.setDescription(itemDto.getDescription());
                item.setQuantity(itemDto.getQuantity());
                
                if (itemDto.getUnitId() != null) {
                    Unit unit = unitRepository.findById(itemDto.getUnitId())
                            .orElseThrow(() -> new ResourceNotFoundException("Единица измерения не найдена: " + itemDto.getUnitId()));
                    item.setUnit(unit);
                }
                
                item.setUnitPrice(itemDto.getUnitPrice());
                item.setVatRate(itemDto.getVatRate());
                item.setNotes(itemDto.getNotes());
                
                // Рассчитываем общую стоимость и НДС
                BigDecimal totalPrice = itemDto.getQuantity().multiply(itemDto.getUnitPrice());
                item.setTotalPrice(totalPrice);
                
                if (itemDto.getVatRate() != null) {
                    BigDecimal vatAmount = totalPrice.multiply(itemDto.getVatRate()).divide(BigDecimal.valueOf(100));
                    item.setVatAmount(vatAmount);
                }
                
                invoice.getInvoiceItems().add(item);
            }
        }
        
        invoice = invoiceRepository.save(invoice);
        return InvoiceDto.fromEntity(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDto getInvoiceById(UUID id) {
        log.info("Получение счета по id: {}", id);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Счет не найден: " + id));
        
        InvoiceDto dto = InvoiceDto.fromEntity(invoice);
        dto.setInvoiceItems(invoice.getInvoiceItems().stream()
                .map(InvoiceItemDto::fromEntity)
                .collect(Collectors.toList()));
        
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getAllInvoices() {
        log.info("Получение всех счетов");
        return invoiceRepository.findAll().stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getInvoicesByRequest(UUID requestId) {
        log.info("Получение счетов по заявке: {}", requestId);
        return invoiceRepository.findByRequestId(requestId).stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getInvoicesByContract(UUID contractId) {
        log.info("Получение счетов по контракту: {}", contractId);
        return invoiceRepository.findByContractId(contractId).stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getInvoicesBySupplier(UUID supplierId) {
        log.info("Получение счетов по поставщику: {}", supplierId);
        return invoiceRepository.findBySupplierId(supplierId).stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getInvoicesByStatus(String status) {
        log.info("Получение счетов по статусу: {}", status);
        Invoice.InvoiceStatus invoiceStatus = Invoice.InvoiceStatus.valueOf(status.toUpperCase());
        return invoiceRepository.findByStatus(invoiceStatus).stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceDto updateInvoice(UUID id, InvoiceDtoUpdate invoiceDtoUpdate) {
        log.info("Обновление счета: {} с данными: {}", id, invoiceDtoUpdate);
        
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Счет не найден: " + id));
        
        // Обновляем основные поля
        if (invoiceDtoUpdate.getInvoiceNumber() != null) {
            invoice.setInvoiceNumber(invoiceDtoUpdate.getInvoiceNumber());
        }
        if (invoiceDtoUpdate.getInvoiceDate() != null) {
            invoice.setInvoiceDate(invoiceDtoUpdate.getInvoiceDate());
        }
        if (invoiceDtoUpdate.getDueDate() != null) {
            invoice.setDueDate(invoiceDtoUpdate.getDueDate());
        }
        if (invoiceDtoUpdate.getPaymentDate() != null) {
            invoice.setPaymentDate(invoiceDtoUpdate.getPaymentDate());
        }
        if (invoiceDtoUpdate.getTotalAmount() != null) {
            invoice.setTotalAmount(invoiceDtoUpdate.getTotalAmount());
        }
        if (invoiceDtoUpdate.getPaidAmount() != null) {
            invoice.setPaidAmount(invoiceDtoUpdate.getPaidAmount());
        }
        if (invoiceDtoUpdate.getVatAmount() != null) {
            invoice.setVatAmount(invoiceDtoUpdate.getVatAmount());
        }
        if (invoiceDtoUpdate.getCurrency() != null) {
            invoice.setCurrency(invoiceDtoUpdate.getCurrency());
        }
        if (invoiceDtoUpdate.getPaymentTerms() != null) {
            invoice.setPaymentTerms(invoiceDtoUpdate.getPaymentTerms());
        }
        if (invoiceDtoUpdate.getNotes() != null) {
            invoice.setNotes(invoiceDtoUpdate.getNotes());
        }
        
        invoice.setUpdatedAt(LocalDateTime.now());
        invoice = invoiceRepository.save(invoice);
        
        return InvoiceDto.fromEntity(invoice);
    }

    @Override
    public void deleteInvoice(UUID id) {
        log.info("Удаление счета: {}", id);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Счет не найден: " + id));
        
        invoiceRepository.delete(invoice);
    }

    @Override
    public InvoiceDto confirmInvoice(UUID id) {
        log.info("Подтверждение счета: {}", id);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Счет не найден: " + id));
        
        if (invoice.getStatus() != Invoice.InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Можно подтверждать только черновики счетов");
        }
        
        invoice.setStatus(Invoice.InvoiceStatus.CONFIRMED);
        invoice.setUpdatedAt(LocalDateTime.now());
        invoice = invoiceRepository.save(invoice);
        
        return InvoiceDto.fromEntity(invoice);
    }

    @Override
    public InvoiceDto payInvoice(UUID id, Double amount) {
        log.info("Оплата счета: {} на сумму: {}", id, amount);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Счет не найден: " + id));
        
        BigDecimal paymentAmount = amount != null ? BigDecimal.valueOf(amount) : invoice.getRemainingAmount();
        
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Сумма оплаты должна быть больше нуля");
        }
        
        if (paymentAmount.compareTo(invoice.getRemainingAmount()) > 0) {
            throw new IllegalArgumentException("Сумма оплаты не может превышать оставшуюся сумму");
        }
        
        BigDecimal newPaidAmount = invoice.getPaidAmount().add(paymentAmount);
        invoice.setPaidAmount(newPaidAmount);
        invoice.setPaymentDate(LocalDate.now());
        
        // Обновляем статус
        if (invoice.isFullyPaid()) {
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
        } else {
            invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
        }
        
        invoice.setUpdatedAt(LocalDateTime.now());
        invoice = invoiceRepository.save(invoice);
        
        return InvoiceDto.fromEntity(invoice);
    }

    @Override
    public InvoiceDto cancelInvoice(UUID id) {
        log.info("Отмена счета: {}", id);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Счет не найден: " + id));
        
        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new IllegalStateException("Нельзя отменить полностью оплаченный счет");
        }
        
        invoice.setStatus(Invoice.InvoiceStatus.CANCELLED);
        invoice.setUpdatedAt(LocalDateTime.now());
        invoice = invoiceRepository.save(invoice);
        
        return InvoiceDto.fromEntity(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getOverdueInvoices() {
        log.info("Получение просроченных счетов");
        return invoiceRepository.findOverdueInvoices().stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getPendingPaymentInvoices() {
        log.info("Получение счетов ожидающих оплаты");
        return invoiceRepository.findPendingPaymentInvoices().stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceItemDto> getInvoiceItems(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Счет не найден: " + invoiceId));
        
        return invoice.getInvoiceItems().stream()
                .map(this::mapInvoiceItemToDto)
                .collect(Collectors.toList());
    }

    private InvoiceItemDto mapInvoiceItemToDto(InvoiceItem item) {
        InvoiceItemDto dto = new InvoiceItemDto();
        dto.setId(item.getId());
        dto.setInvoiceId(item.getInvoice().getId());
        
        if (item.getMaterial() != null) {
            dto.setMaterialId(item.getMaterial().getId());
            dto.setMaterialName(item.getMaterial().getName());
        }
        
        dto.setDescription(item.getDescription());
        dto.setQuantity(item.getQuantity());
        
        if (item.getUnit() != null) {
            dto.setUnitId(item.getUnit().getId());
            dto.setUnitName(item.getUnit().getName());
        }
        
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        
        return dto;
    }
} 