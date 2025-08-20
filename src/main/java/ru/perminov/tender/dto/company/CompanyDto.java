package ru.perminov.tender.dto.company;

import java.util.UUID;
import java.util.List;
import java.math.BigDecimal;

public record CompanyDto(
        UUID id,

        String inn,

        String kpp,

        String ogrn,

        String name,

        String legalName,

        String shortName,

        String address,

        String typeId,
        
        String typeName,
        
        String role,
        
        String director,

        String phone,

        String email,

        List<BankAccountDto> bankDetails,

        Boolean sendNotifications,

        Boolean vatApplicable,

        BigDecimal vatRate
) {
}
