package ru.perminov.tender.dto.company;

import java.util.UUID;

public record CompanyDto(
        UUID id,

        String inn,

        String kpp,

        String ogrn,

        String name,

        String legalName,

        String address,

        String typeId,
        
        String typeName,
        
        String director,

        String phone,

        String email
) {
}
