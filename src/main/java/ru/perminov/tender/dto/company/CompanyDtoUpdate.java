package ru.perminov.tender.dto.company;

import jakarta.validation.constraints.Pattern;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.model.company.CompanyType;

import java.util.List;
import java.util.UUID;

public record CompanyDtoUpdate(

        UUID uuid,

        @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
        String inn,

        @Pattern(regexp = "^\\d{9}$", message = "КПП должен содержать 9 цифр")
        String kpp,

        @Pattern(regexp = "^\\d{13}|\\d{15}$", message = "ОГРН должен содержать 13 или 15 цифр")
        String ogrn,

        String name,

        String legalName,

        String shortName,

        String address,

        String typeId,

        String director,

        String phone,

        String email,

        List<BankAccountDto> bankDetails,

        List<ContactPersonDtoUpdate> contactPersons,

        String role,

        Boolean sendNotifications

) {
    public CompanyDtoUpdate {
        if (contactPersons == null) {
            contactPersons = List.of();
        }
        if (bankDetails == null) {
            bankDetails = List.of();
        }
    }
}
