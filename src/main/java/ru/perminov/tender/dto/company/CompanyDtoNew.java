package ru.perminov.tender.dto.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;

import java.util.List;
import java.util.UUID;

public record CompanyDtoNew(

        UUID uuid,

    @NotBlank(message = "ИНН не может быть пустым")
    @Pattern(regexp = "^\\d{10}|\\d{12}$", message = "ИНН должен содержать 10 или 12 цифр")
    String inn,

    @NotBlank(message = "КПП не может быть пустым")
    @Pattern(regexp = "^\\d{9}$", message = "КПП должен содержать 9 цифр")
    String kpp,

    @NotBlank(message = "ОГРН не может быть пустым")
    @Pattern(regexp = "^\\d{13}|\\d{15}$", message = "ОГРН должен содержать 13 или 15 цифр")
    String ogrn,

    @NotBlank(message = "Название компании не может быть пустым")
    String name,

    @NotBlank(message = "Адрес не может быть пустым")
    String address,

    String typeId,

    String typeName,

    String director,

    String phone,

    String email,

    @NotBlank
    String bankName,

    @NotBlank
    String bankAccount,

    @NotBlank
    String correspondentAccount,

    @NotBlank
    String bik,

    List<ContactPersonDtoNew> contactPersons

) {
    public CompanyDtoNew {
        if (contactPersons == null) {
            contactPersons = List.of();
        }
    }
} 