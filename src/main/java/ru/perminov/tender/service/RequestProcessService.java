package ru.perminov.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.RequestProcessDto;
import ru.perminov.tender.model.*;
import ru.perminov.tender.repository.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RequestProcessService {

    private final RequestRepository requestRepository;
    private final TenderRepository tenderRepository;
    private final SupplierProposalRepository supplierProposalRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final DeliveryRepository deliveryRepository;
    private final ReceiptRepository receiptRepository;

    public RequestProcessDto getRequestProcess(UUID requestId) {
        log.info("Загрузка процесса заявки с ID: {}", requestId);
        
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

        log.info("Заявка {} найдена: номер {}, организация: {}", 
                requestId, request.getRequestNumber(), 
                request.getOrganization() != null ? request.getOrganization().getName() : "не указана");

        RequestProcessDto dto = new RequestProcessDto();
        dto.setRequestId(request.getId());
        dto.setRequestNumber(request.getRequestNumber());
        dto.setRequestDate(request.getDate());
        dto.setOrganization(request.getOrganization() != null ? request.getOrganization().getName() : "");
        dto.setProject(request.getProject() != null ? request.getProject().getName() : "");
        dto.setLocation(request.getLocation());
        dto.setApplicant(request.getApplicant());
        dto.setApprover(request.getApprover());
        dto.setPerformer(request.getPerformer());
        dto.setDeliveryDeadline(request.getDeliveryDeadline());
        dto.setStatus(request.getStatus() != null ? request.getStatus().name() : "");
        dto.setNotes(request.getNotes());
        dto.setMaterialsCount(request.getRequestMaterials().size());

        // Загружаем тендеры
        log.info("Поиск тендеров для заявки {}", requestId);
        
        // Проверяем количество тендеров через COUNT запрос
        long tenderCount = tenderRepository.countByRequestId(requestId);
        log.info("Количество тендеров для заявки {} (через COUNT): {}", requestId, tenderCount);
        
        List<Tender> tenders = tenderRepository.findAllByRequestId(requestId);
        log.info("Найдено тендеров для заявки {}: {}", requestId, tenders.size());
        
        if (tenders.isEmpty()) {
            log.warn("Тендеры для заявки {} не найдены", requestId);
        } else {
            tenders.forEach(tender -> log.info("Найден тендер: {} (ID: {}) для заявки {}", 
                    tender.getTenderNumber(), tender.getId(), requestId));
        }
        
        dto.setTendersCount(tenders.size());
        dto.setTenders(tenders.stream().map(this::mapTenderToDto).collect(Collectors.toList()));

        // Загружаем счета
        List<Invoice> invoices = invoiceRepository.findInvoicesByRequestOrderByDate(requestId);
        dto.setInvoicesCount(invoices.size());
        dto.setInvoices(invoices.stream().map(this::mapInvoiceToDto).collect(Collectors.toList()));

        // Загружаем поставки
        List<Delivery> deliveries = deliveryRepository.findByContractTenderRequestId(requestId);
        dto.setDeliveriesCount(deliveries.size());
        dto.setDeliveries(deliveries.stream().map(this::mapDeliveryToDto).collect(Collectors.toList()));

        // Рассчитываем финансовые показатели
        calculateFinancialMetrics(dto, request, tenders, invoices);

        return dto;
    }

    public List<RequestProcessDto> getRequestProcessList() {
        List<Request> requests = requestRepository.findAll();
        return requests.stream()
                .map(request -> getRequestProcess(request.getId()))
                .collect(Collectors.toList());
    }

    private RequestProcessDto.TenderProcessDto mapTenderToDto(Tender tender) {
        log.info("Маппинг тендера: {} (ID: {})", tender.getTenderNumber(), tender.getId());
        
        RequestProcessDto.TenderProcessDto dto = new RequestProcessDto.TenderProcessDto();
        dto.setTenderId(tender.getId());
        dto.setTenderNumber(tender.getTenderNumber());
        dto.setTenderDate(tender.getStartDate() != null ? tender.getStartDate().toLocalDate() : null);
        log.info("Тендер {}: дата тендера установлена: {}", tender.getTenderNumber(), dto.getTenderDate());
        dto.setStatus(tender.getStatus().name());
        
        log.info("Тендер {}: дата начала: {}, статус: {}", 
                tender.getTenderNumber(), 
                tender.getStartDate(), 
                tender.getStatus());
        
        // Рассчитываем общую сумму тендера
        log.info("Тендер {}: загружаем элементы тендера", tender.getTenderNumber());
        BigDecimal totalAmount = tender.getTenderItems().stream()
                .map(item -> {
                    BigDecimal quantity = BigDecimal.valueOf(item.getQuantity() != null ? item.getQuantity() : 0.0);
                    BigDecimal price = BigDecimal.valueOf(item.getEstimatedPrice() != null ? item.getEstimatedPrice() : 0.0);
                    BigDecimal itemTotal = quantity.multiply(price);
                    log.info("Элемент тендера: количество={}, цена={}, сумма={}", quantity, price, itemTotal);
                    return itemTotal;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);
        
        log.info("Тендер {}: количество элементов: {}, общая сумма: {}", 
                tender.getTenderNumber(), 
                tender.getTenderItems().size(), 
                totalAmount);

        // Загружаем предложения
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tender.getId());
        dto.setProposalsCount(proposals.size());
        dto.setSelectedProposalsCount((int) proposals.stream()
                .filter(p -> p.getStatus() == SupplierProposal.ProposalStatus.ACCEPTED)
                .count());
        dto.setProposals(proposals.stream().map(this::mapProposalToDto).collect(Collectors.toList()));
        
        log.info("Тендер {}: количество предложений: {}, выбранных: {}", 
                tender.getTenderNumber(), 
                proposals.size(), 
                dto.getSelectedProposalsCount());

        return dto;
    }

    private RequestProcessDto.SupplierProposalDto mapProposalToDto(SupplierProposal proposal) {
        RequestProcessDto.SupplierProposalDto dto = new RequestProcessDto.SupplierProposalDto();
        dto.setProposalId(proposal.getId());
        dto.setProposalNumber(proposal.getProposalNumber());
        dto.setSupplierName(proposal.getSupplier() != null ? proposal.getSupplier().getName() : "");
        dto.setSupplierContact(proposal.getSupplier() != null && !proposal.getSupplier().getContactPersons().isEmpty() 
                ? proposal.getSupplier().getContactPersons().get(0).getFirstName() + " " + proposal.getSupplier().getContactPersons().get(0).getLastName() : "");
        dto.setSupplierPhone(proposal.getSupplier() != null ? proposal.getSupplier().getPhone() : "");
        dto.setSubmissionDate(proposal.getSubmissionDate().toLocalDate());
        dto.setStatus(proposal.getStatus().name());
        dto.setTotalPrice(BigDecimal.valueOf(proposal.getTotalPrice() != null ? proposal.getTotalPrice() : 0.0));
        dto.setCurrency(proposal.getCurrency());
        return dto;
    }

    private RequestProcessDto.InvoiceProcessDto mapInvoiceToDto(Invoice invoice) {
        RequestProcessDto.InvoiceProcessDto dto = new RequestProcessDto.InvoiceProcessDto();
        dto.setInvoiceId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setPaymentDate(invoice.getPaymentDate());
        dto.setSupplierName(invoice.getSupplier() != null ? invoice.getSupplier().getName() : "");
        dto.setSupplierContact(invoice.getSupplier() != null && !invoice.getSupplier().getContactPersons().isEmpty() 
                ? invoice.getSupplier().getContactPersons().get(0).getFirstName() + " " + invoice.getSupplier().getContactPersons().get(0).getLastName() : "");
        dto.setSupplierPhone(invoice.getSupplier() != null ? invoice.getSupplier().getPhone() : "");
        dto.setStatus(invoice.getStatus().name());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setPaidAmount(invoice.getPaidAmount());
        dto.setRemainingAmount(invoice.getRemainingAmount());
        dto.setCurrency(invoice.getCurrency());

        // Загружаем поступления для этого счета
        List<Receipt> receipts = receiptRepository.findByInvoiceId(invoice.getId());
        dto.setReceipts(receipts.stream().map(this::mapReceiptToDto).collect(Collectors.toList()));

        return dto;
    }

    private RequestProcessDto.DeliveryProcessDto mapDeliveryToDto(Delivery delivery) {
        RequestProcessDto.DeliveryProcessDto dto = new RequestProcessDto.DeliveryProcessDto();
        dto.setDeliveryId(delivery.getId());
        dto.setDeliveryNumber(delivery.getDeliveryNumber());
        dto.setDeliveryDate(delivery.getDeliveryDate());
        dto.setSupplierName(delivery.getSupplier() != null ? delivery.getSupplier().getName() : "");
        dto.setStatus(delivery.getStatus().name());
        
        // Рассчитываем общую сумму поставки
        BigDecimal totalAmount = delivery.getDeliveryItems().stream()
                .map(item -> item.getDeliveredQuantity().multiply(item.getUnitPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);

        // Загружаем поступления для этой поставки
        List<Receipt> receipts = receiptRepository.findByDeliveryId(delivery.getId());
        dto.setReceipts(receipts.stream().map(this::mapReceiptToDto).collect(Collectors.toList()));

        return dto;
    }

    private RequestProcessDto.ReceiptProcessDto mapReceiptToDto(Receipt receipt) {
        RequestProcessDto.ReceiptProcessDto dto = new RequestProcessDto.ReceiptProcessDto();
        dto.setReceiptId(receipt.getId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        dto.setReceiptDate(receipt.getReceiptDate());
        dto.setStatus(receipt.getStatus().name());
        dto.setTotalAmount(receipt.getTotalAmount());
        dto.setCurrency(receipt.getCurrency());
        return dto;
    }

    private void calculateFinancialMetrics(RequestProcessDto dto, Request request, List<Tender> tenders, List<Invoice> invoices) {
        // Рассчитываем общую сумму заявки
        BigDecimal requestTotal = request.getRequestMaterials().stream()
                .map(item -> BigDecimal.valueOf(item.getQuantity() != null ? item.getQuantity() : 0.0)
                        .multiply(BigDecimal.valueOf(item.getEstimatePrice() != null ? item.getEstimatePrice() : 0.0)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setRequestTotalAmount(requestTotal);

        // Рассчитываем общую сумму тендеров
        BigDecimal tenderTotal = tenders.stream()
                .map(tender -> tender.getTenderItems().stream()
                        .map(item -> BigDecimal.valueOf(item.getQuantity() != null ? item.getQuantity() : 0.0)
                                .multiply(BigDecimal.valueOf(item.getEstimatedPrice() != null ? item.getEstimatedPrice() : 0.0)))
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTenderTotalAmount(tenderTotal);

        // Рассчитываем дельту
        dto.setDeltaAmount(requestTotal.subtract(tenderTotal));
    }
} 