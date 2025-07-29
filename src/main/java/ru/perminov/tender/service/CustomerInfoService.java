package ru.perminov.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.customer.CustomerInfoDto;
import ru.perminov.tender.dto.customer.CustomerSummaryDto;
import ru.perminov.tender.dto.customer.CustomerHierarchyDto;
import ru.perminov.tender.dto.customer.RequestHierarchyDto;
import ru.perminov.tender.dto.customer.TenderHierarchyDto;
import ru.perminov.tender.dto.customer.DeliveryHierarchyDto;
import ru.perminov.tender.dto.customer.SupplierInfoDto;
import ru.perminov.tender.dto.customer.ContactPersonDto;
import ru.perminov.tender.dto.customer.InvoiceDto;
import ru.perminov.tender.dto.customer.PaymentDto;
import ru.perminov.tender.dto.customer.InvoiceItemDto;
import ru.perminov.tender.dto.customer.PaymentItemDto;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.Delivery;
import ru.perminov.tender.model.Payment;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.repository.DeliveryRepository;
import ru.perminov.tender.repository.PaymentRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.mapper.company.CompanyMapper;
import ru.perminov.tender.mapper.RequestMapper;
import ru.perminov.tender.mapper.TenderMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerInfoService {
    
    private final RequestRepository requestRepository;
    private final TenderRepository tenderRepository;
    private final DeliveryRepository deliveryRepository;
    private final PaymentRepository paymentRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final RequestMapper requestMapper;
    private final TenderMapper tenderMapper;

        @Transactional(readOnly = true)
    public List<CustomerHierarchyDto> getCustomerHierarchy() {
        log.info("Получение иерархической сводки по заказчикам");

        // Группируем заявки по заказчикам
        List<Request> allRequests = requestRepository.findAllWithOrganization();
        log.info("Всего найдено заявок: {}", allRequests.size());
        
        Map<UUID, List<Request>> requestsByCustomer = allRequests.stream()
            .collect(Collectors.groupingBy(request -> request.getOrganization().getId()));

        log.info("Найдено заказчиков с заявками: {}", requestsByCustomer.size());

        return requestsByCustomer.entrySet().stream()
            .map(entry -> createCustomerHierarchy(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CustomerSummaryDto> getCustomerSummary() {
        log.info("Получение сводки по заказчикам");

        List<CustomerSummaryDto> summary = requestRepository.findAllWithOrganization().stream()
            .map(this::createCustomerSummaryFromRequest)
            .collect(Collectors.toList());

        // Добавляем информацию о тендерах
        List<CustomerSummaryDto> tenderSummary = tenderRepository.findAllWithCustomer().stream()
            .map(this::createCustomerSummaryFromTender)
            .collect(Collectors.toList());

        summary.addAll(tenderSummary);

        return summary;
    }

        @Transactional(readOnly = true)
    public CustomerInfoDto getCustomerInfo(UUID customerId) {
        log.info("Получение детальной информации по заказчику customerId={}", customerId);

        Company customer = companyRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("Заказчик не найден"));

        // Находим заявки для этого заказчика
        List<Request> requests = requestRepository.findByOrganizationId(customerId);
        if (requests.isEmpty()) {
            throw new RuntimeException("Заявки для заказчика не найдены");
        }

        Request request = requests.get(0); // Берем первую заявку
        Tender tender = tenderRepository.findByRequestId(request.getId()).orElse(null);

        // Получаем информацию о поставщиках
        List<SupplierInfoDto> suppliers = getSuppliersInfo(request.getId());

        return new CustomerInfoDto(
            customerId,
            companyMapper.toCompanyDto(customer),
            requestMapper.toDto(request),
            tender != null ? tenderMapper.toDto(tender) : null,
            suppliers
        );
    }

        @Transactional(readOnly = true)
    public CustomerInfoDto getCustomerInfoByRequest(UUID requestId) {
        log.info("Получение информации по заказчику через заявку requestId={}", requestId);

        Request request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

        Company customer = request.getOrganization();
        Tender tender = tenderRepository.findByRequestId(requestId).orElse(null);

        // Получаем информацию о поставщиках
        List<SupplierInfoDto> suppliers = getSuppliersInfo(requestId);

        return new CustomerInfoDto(
            customer.getId(),
            companyMapper.toCompanyDto(customer),
            requestMapper.toDto(request),
            tender != null ? tenderMapper.toDto(tender) : null,
            suppliers
        );
    }

    @Transactional(readOnly = true)
    public CustomerInfoDto getCustomerInfoByRequestNumber(String requestNumber) {
        log.info("Получение информации по заказчику через номер заявки requestNumber={}", requestNumber);

        Request request = requestRepository.findByRequestNumber(requestNumber)
            .orElseThrow(() -> new RuntimeException("Заявка с номером " + requestNumber + " не найдена"));

        Company customer = request.getOrganization();
        Tender tender = tenderRepository.findByRequestId(request.getId()).orElse(null);

        // Получаем информацию о поставщиках
        List<SupplierInfoDto> suppliers = getSuppliersInfo(request.getId());

        return new CustomerInfoDto(
            customer.getId(),
            companyMapper.toCompanyDto(customer),
            requestMapper.toDto(request),
            tender != null ? tenderMapper.toDto(tender) : null,
            suppliers
        );
    }

    private CustomerSummaryDto createCustomerSummaryFromRequest(Request request) {
        return new CustomerSummaryDto(
            request.getOrganization().getId(),
            request.getOrganization().getName(),
            request.getOrganization().getShortName(),
            request.getRequestNumber(),
            "Заявка",
            request.getDate(),
            request.getProject() != null ? request.getProject().getName() : "",
            calculateRequestAmount(request),
            request.getStatus().name()
        );
    }

    private CustomerSummaryDto createCustomerSummaryFromTender(Tender tender) {
        return new CustomerSummaryDto(
            tender.getCustomer().getId(),
            tender.getCustomer().getName(),
            tender.getCustomer().getShortName(),
            tender.getTenderNumber(),
            "Тендер",
            tender.getStartDate().toLocalDate(),
            tender.getRequest() != null && tender.getRequest().getProject() != null ? 
                tender.getRequest().getProject().getName() : "",
            calculateTenderAmount(tender),
            tender.getStatus().name()
        );
    }

    private BigDecimal calculateRequestAmount(Request request) {
        return request.getRequestMaterials().stream()
            .map(material -> {
                BigDecimal quantity = new BigDecimal(material.getQuantity() != null ? material.getQuantity().toString() : "0");
                BigDecimal price = material.getEstimatePrice() != null ? 
                    new BigDecimal(material.getEstimatePrice().toString()) : BigDecimal.ZERO;
                return quantity.multiply(price);
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTenderAmount(Tender tender) {
        return tender.getTenderItems().stream()
            .map(item -> {
                BigDecimal quantity = new BigDecimal(item.getQuantity() != null ? item.getQuantity().toString() : "0");
                BigDecimal price = new BigDecimal(item.getEstimatedPrice() != null ? item.getEstimatedPrice().toString() : "0");
                return quantity.multiply(price);
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

            private CustomerHierarchyDto createCustomerHierarchy(UUID customerId, List<Request> requests) {
        // Получаем информацию о заказчике
        Company customer = companyRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("Заказчик не найден"));

        // Создаем иерархию заявок с тендерами
        List<RequestHierarchyDto> requestHierarchies = requests.stream()
            .map(this::createRequestHierarchy)
            .collect(Collectors.toList());

        return new CustomerHierarchyDto(
            customerId,
            customer.getName(),
            customer.getShortName(),
            requestHierarchies
        );
    }

    private RequestHierarchyDto createRequestHierarchy(Request request) {
        // Получаем тендеры для заявки
        List<Tender> tenders = tenderRepository.findAllByRequestId(request.getId());
        
        log.info("Для заявки {} найдено тендеров: {}", request.getRequestNumber(), tenders.size());
        if (tenders.isEmpty()) {
            log.info("Тендеры для заявки {} не найдены", request.getRequestNumber());
        } else {
            tenders.forEach(tender -> log.info("Найден тендер: {} для заявки {}", tender.getTenderNumber(), request.getRequestNumber()));
        }

        List<TenderHierarchyDto> tenderHierarchies = tenders.stream()
            .map(this::createTenderHierarchy)
            .collect(Collectors.toList());

        return new RequestHierarchyDto(
            request.getId(),
            request.getRequestNumber(),
            request.getDate(),
            request.getProject() != null ? request.getProject().getName() : "",
            calculateRequestAmount(request),
            request.getStatus().name(),
            tenderHierarchies
        );
    }

    private TenderHierarchyDto createTenderHierarchy(Tender tender) {
        // Получаем поставки для тендера
        List<Delivery> deliveries = deliveryRepository.findByContractTenderRequestId(tender.getRequest().getId());
        
        List<DeliveryHierarchyDto> deliveryHierarchies = deliveries.stream()
            .map(this::createDeliveryHierarchy)
            .collect(Collectors.toList());

        return new TenderHierarchyDto(
            tender.getId(),
            tender.getTenderNumber(),
            tender.getStartDate().toLocalDate(),
            tender.getRequest() != null && tender.getRequest().getProject() != null ?
                tender.getRequest().getProject().getName() : "",
            calculateTenderAmount(tender),
            tender.getStatus().name(),
            deliveryHierarchies
        );
    }

    private DeliveryHierarchyDto createDeliveryHierarchy(Delivery delivery) {
        // Вычисляем общую сумму из элементов поставки
        BigDecimal totalAmount = delivery.getDeliveryItems().stream()
            .map(item -> item.getDeliveredQuantity().multiply(item.getUnitPrice()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        return new DeliveryHierarchyDto(
            delivery.getId(),
            delivery.getDeliveryNumber(),
            delivery.getDeliveryDate(),
            delivery.getSupplier().getName(),
            totalAmount,
            delivery.getStatus().name()
        );
    }

    private List<SupplierInfoDto> getSuppliersInfo(UUID requestId) {
        // Получаем поставки для заявки
        List<Delivery> deliveries = deliveryRepository.findByContractTenderRequestId(requestId);

        return deliveries.stream()
            .map(delivery -> {
                Company supplier = delivery.getSupplier();

                // Получаем счета и платежи для поставщика
                List<InvoiceDto> invoices = getInvoicesForSupplier(supplier.getId(), requestId);
                List<PaymentDto> payments = getPaymentsForSupplier(supplier.getId(), requestId);

                // Возвращаем информацию о поставщике без контактных лиц пока
                return new SupplierInfoDto(
                    supplier.getId(),
                    companyMapper.toCompanyDto(supplier),
                    null, // Пока оставляем null для контактов
                    invoices,
                    payments
                );
            })
            .collect(Collectors.toList());
    }

    private List<InvoiceDto> getInvoicesForSupplier(UUID supplierId, UUID requestId) {
        // Здесь должна быть логика получения счетов
        // Пока возвращаем пустой список
        return List.of();
    }

    private List<PaymentDto> getPaymentsForSupplier(UUID supplierId, UUID requestId) {
        // Здесь должна быть логика получения платежей
        // Пока возвращаем пустой список
        return List.of();
    }
} 