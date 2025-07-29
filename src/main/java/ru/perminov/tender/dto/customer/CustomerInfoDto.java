package ru.perminov.tender.dto.customer;

import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.dto.tender.TenderDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CustomerInfoDto(
    UUID customerId,
    CompanyDto customer,
    RequestDto request,
    TenderDto tender,
    List<SupplierInfoDto> suppliers
) {} 