package ru.perminov.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.RequestProcessDto;
import ru.perminov.tender.model.*;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.*;

import java.math.BigDecimal;
import java.util.ArrayList;
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
        
        // Определяем склад: сначала проверяем location, потом название склада
        String location = request.getLocation();
        if (location == null || location.trim().isEmpty()) {
            location = request.getWarehouse() != null ? request.getWarehouse().getName() : "";
        }
        dto.setLocation(location);
        
        // Логируем информацию о проекте и складе
        log.info("=== ДЕТАЛЬНАЯ ИНФОРМАЦИЯ О ЗАЯВКЕ {} ===", request.getRequestNumber());
        log.info("Проект: '{}'", dto.getProject());
        log.info("Склад (итоговый): '{}'", dto.getLocation());
        log.info("Location (из БД): '{}'", request.getLocation());
        log.info("Warehouse (из БД): {}", request.getWarehouse());
        if (request.getWarehouse() != null) {
            log.info("Warehouse.name: '{}'", request.getWarehouse().getName());
        }
        log.info("==========================================");
        dto.setApplicant(request.getApplicant());
        dto.setApprover(request.getApprover());
        dto.setPerformer(request.getPerformer());
        dto.setDeliveryDeadline(request.getDeliveryDeadline());
        dto.setStatus(request.getStatus() != null ? request.getStatus().name() : "");
        dto.setNotes(request.getNotes());
        dto.setMaterialsCount(request.getRequestMaterials().size());
        
        // Заполняем список материалов
        List<String> materials = request.getRequestMaterials().stream()
                .map(requestMaterial -> {
                    if (requestMaterial.getMaterial() != null) {
                        return requestMaterial.getMaterial().getName();
                    } else if (requestMaterial.getMaterialLink() != null && !requestMaterial.getMaterialLink().trim().isEmpty()) {
                        return requestMaterial.getMaterialLink();
                    } else {
                        return "Материал без названия";
                    }
                })
                .collect(Collectors.toList());
        dto.setMaterials(materials);

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

        // Загружаем контракты
        List<Contract> contracts = contractRepository.findByTenderRequestId(requestId);
        dto.setContractsCount(contracts.size());
        dto.setContracts(contracts.stream().map(this::mapContractToDto).collect(Collectors.toList()));

        // Загружаем счета через контракты
        List<Invoice> invoices = new ArrayList<>();
        log.info("Загружаем счета для {} контрактов", contracts.size());
        for (Contract contract : contracts) {
            log.info("Поиск счетов для контракта: {} ({})", contract.getContractNumber(), contract.getId());
            List<Invoice> contractInvoices = invoiceRepository.findByContractId(contract.getId());
            log.info("Найдено {} счетов для контракта {}", contractInvoices.size(), contract.getContractNumber());
            invoices.addAll(contractInvoices);
        }
        log.info("Всего найдено {} счетов для заявки {}", invoices.size(), requestId);
        dto.setInvoicesCount(invoices.size());
        dto.setInvoices(invoices.stream().map(this::mapInvoiceToDto).collect(Collectors.toList()));

        // Загружаем поставки
        log.info("Поиск поставок для заявки {}", requestId);
        List<Delivery> deliveries = deliveryRepository.findByContractTenderRequestId(requestId);
        log.info("Найдено поставок для заявки {} (через тендер): {}", requestId, deliveries.size());
        
        // Если поставки не найдены через тендер, ищем через контракты напрямую
        if (deliveries.isEmpty() && !contracts.isEmpty()) {
            log.info("Поставки не найдены через тендер, ищем через контракты напрямую");
            for (Contract contract : contracts) {
                log.info("Поиск поставок для контракта: {} ({})", contract.getContractNumber(), contract.getId());
                List<Delivery> contractDeliveries = deliveryRepository.findByContractId(contract.getId());
                log.info("Найдено поставок для контракта {}: {}", contract.getContractNumber(), contractDeliveries.size());
                deliveries.addAll(contractDeliveries);
            }
            log.info("Всего найдено поставок для заявки {} (через контракты): {}", requestId, deliveries.size());
        }
        
        if (deliveries.isEmpty()) {
            log.warn("Поставки для заявки {} не найдены ни через тендер, ни через контракты", requestId);
        } else {
            deliveries.forEach(delivery -> log.info("Найдена поставка: {} (ID: {}) для заявки {}", 
                    delivery.getDeliveryNumber(), delivery.getId(), requestId));
        }
        
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
        dto.setSupplierId(proposal.getSupplier() != null ? proposal.getSupplier().getId() : null);
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
        dto.setDueDate(invoice.getDueDate());
        
        // Добавляем информацию о контракте
        if (invoice.getContract() != null) {
            dto.setContractId(invoice.getContract().getId());
            dto.setContractNumber(invoice.getContract().getContractNumber());
            log.info("Счет {} привязан к контракту {} ({})", 
                    invoice.getInvoiceNumber(), 
                    invoice.getContract().getContractNumber(), 
                    invoice.getContract().getId());
        } else {
            log.warn("Счет {} не привязан к контракту", invoice.getInvoiceNumber());
        }
        
        dto.setSupplierName(invoice.getSupplier() != null ? invoice.getSupplier().getName() : "");
        dto.setSupplierContact(invoice.getSupplier() != null && invoice.getSupplier().getContactPersons() != null && !invoice.getSupplier().getContactPersons().isEmpty() 
                ? invoice.getSupplier().getContactPersons().get(0).getFirstName() + " " + invoice.getSupplier().getContactPersons().get(0).getLastName() : "");
        dto.setSupplierPhone(invoice.getSupplier() != null ? invoice.getSupplier().getPhone() : "");
        dto.setStatus(invoice.getStatus() != null ? invoice.getStatus().name() : "");
        dto.setTotalAmount(invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO);
        dto.setPaidAmount(invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO);
        dto.setRemainingAmount(invoice.getRemainingAmount() != null ? invoice.getRemainingAmount() : BigDecimal.ZERO);
        dto.setCurrency(invoice.getCurrency() != null ? invoice.getCurrency() : "RUB");
        dto.setVatAmount(invoice.getVatAmount() != null ? invoice.getVatAmount() : BigDecimal.ZERO);
        dto.setPaymentTerms(invoice.getPaymentTerms());
        dto.setNotes(invoice.getNotes());

        // Загружаем материалы счета
        List<RequestProcessDto.InvoiceItemDto> invoiceItems = invoice.getInvoiceItems().stream()
                .map(this::mapInvoiceItemToDto)
                .collect(Collectors.toList());
        dto.setInvoiceItems(invoiceItems);

        // Загружаем поступления для этого счета
        List<Receipt> receipts = receiptRepository.findByInvoiceId(invoice.getId());
        dto.setReceipts(receipts.stream().map(this::mapReceiptToDto).collect(Collectors.toList()));

        return dto;
    }
    
    private RequestProcessDto.InvoiceItemDto mapInvoiceItemToDto(InvoiceItem invoiceItem) {
        RequestProcessDto.InvoiceItemDto dto = new RequestProcessDto.InvoiceItemDto();
        dto.setId(invoiceItem.getId());
        dto.setMaterialName(invoiceItem.getMaterial() != null ? invoiceItem.getMaterial().getName() : 
                           (invoiceItem.getDescription() != null ? invoiceItem.getDescription() : "Материал не указан"));
        dto.setQuantity(invoiceItem.getQuantity() != null ? invoiceItem.getQuantity().doubleValue() : 0.0);
        dto.setUnitName(invoiceItem.getUnit() != null ? invoiceItem.getUnit().getName() : "");
        dto.setUnitPrice(invoiceItem.getUnitPrice() != null ? invoiceItem.getUnitPrice() : BigDecimal.ZERO);
        dto.setTotalPrice(invoiceItem.getTotalPrice() != null ? invoiceItem.getTotalPrice() : BigDecimal.ZERO);
        return dto;
    }

    private RequestProcessDto.DeliveryProcessDto mapDeliveryToDto(Delivery delivery) {
        log.info("Маппинг поставки: {} (ID: {})", delivery.getDeliveryNumber(), delivery.getId());
        
        RequestProcessDto.DeliveryProcessDto dto = new RequestProcessDto.DeliveryProcessDto();
        dto.setDeliveryId(delivery.getId());
        dto.setDeliveryNumber(delivery.getDeliveryNumber());
        dto.setDeliveryDate(delivery.getDeliveryDate());
        dto.setContractId(delivery.getContract() != null ? delivery.getContract().getId() : null);
        dto.setContractNumber(delivery.getContract() != null ? delivery.getContract().getContractNumber() : "");
        dto.setSupplierName(delivery.getSupplier() != null ? delivery.getSupplier().getName() : "");
        dto.setStatus(delivery.getStatus() != null ? delivery.getStatus().name() : "");
        
        log.info("Поставка {}: дата поставки: {}, поставщик: {}, статус: {}", 
                delivery.getDeliveryNumber(), 
                delivery.getDeliveryDate(), 
                dto.getSupplierName(), 
                dto.getStatus());
        
        // Рассчитываем общую сумму поставки
        BigDecimal totalAmount = delivery.getDeliveryItems().stream()
                .map(item -> {
                    BigDecimal quantity = item.getDeliveredQuantity() != null ? item.getDeliveredQuantity() : BigDecimal.ZERO;
                    BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                    return quantity.multiply(price);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);
        
        log.info("Поставка {}: количество элементов: {}, общая сумма: {}", 
                delivery.getDeliveryNumber(), 
                delivery.getDeliveryItems().size(), 
                totalAmount);

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
        dto.setStatus(receipt.getStatus() != null ? receipt.getStatus().name() : "");
        dto.setTotalAmount(receipt.getTotalAmount() != null ? receipt.getTotalAmount() : BigDecimal.ZERO);
        dto.setCurrency(receipt.getCurrency() != null ? receipt.getCurrency() : "RUB");
        return dto;
    }

    private RequestProcessDto.ContractProcessDto mapContractToDto(Contract contract) {
        RequestProcessDto.ContractProcessDto dto = new RequestProcessDto.ContractProcessDto();
        dto.setContractId(contract.getId());
        dto.setContractNumber(contract.getContractNumber());
        dto.setContractDate(contract.getCreatedAt().toLocalDate());
        
        // Получаем данные поставщика через supplierProposal
        Company supplier = null;
        if (contract.getSupplierProposal() != null && contract.getSupplierProposal().getSupplier() != null) {
            supplier = contract.getSupplierProposal().getSupplier();
        }
        
        dto.setSupplierName(supplier != null ? supplier.getName() : "");
        dto.setSupplierContact(supplier != null && supplier.getContactPersons() != null && !supplier.getContactPersons().isEmpty() 
                ? supplier.getContactPersons().get(0).getFirstName() + " " + supplier.getContactPersons().get(0).getLastName() : "");
        dto.setSupplierPhone(supplier != null ? supplier.getPhone() : "");
        dto.setStatus(contract.getStatus() != null ? contract.getStatus().name() : "");
        dto.setTotalAmount(contract.getTotalAmount() != null ? contract.getTotalAmount() : BigDecimal.ZERO);
        dto.setStartDate(contract.getStartDate());
        dto.setEndDate(contract.getEndDate());
        dto.setDescription(contract.getDescription());
        
        // Загружаем материалы контракта
        List<RequestProcessDto.ContractItemDto> contractItems = contract.getContractItems().stream()
                .map(this::mapContractItemToDto)
                .collect(Collectors.toList());
        dto.setContractItems(contractItems);
        
        return dto;
    }
    
    private RequestProcessDto.ContractItemDto mapContractItemToDto(ContractItem contractItem) {
        RequestProcessDto.ContractItemDto dto = new RequestProcessDto.ContractItemDto();
        dto.setId(contractItem.getId());
        dto.setMaterialName(contractItem.getMaterial() != null ? contractItem.getMaterial().getName() : 
                           (contractItem.getDescription() != null ? contractItem.getDescription() : "Материал не указан"));
        dto.setQuantity(contractItem.getQuantity() != null ? contractItem.getQuantity().doubleValue() : 0.0);
        dto.setUnitName(contractItem.getUnit() != null ? contractItem.getUnit().getName() : "");
        dto.setUnitPrice(contractItem.getUnitPrice() != null ? contractItem.getUnitPrice() : BigDecimal.ZERO);
        dto.setTotalPrice(contractItem.getTotalPrice() != null ? contractItem.getTotalPrice() : BigDecimal.ZERO);
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