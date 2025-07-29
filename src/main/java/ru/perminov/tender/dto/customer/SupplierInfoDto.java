package ru.perminov.tender.dto.customer;

import ru.perminov.tender.dto.company.CompanyDto;

import java.util.List;
import java.util.UUID;

public record SupplierInfoDto(
    UUID supplierId,
    CompanyDto supplier,
    ContactPersonDto contact,
    List<InvoiceDto> invoices,
    List<PaymentDto> payments
) {} 