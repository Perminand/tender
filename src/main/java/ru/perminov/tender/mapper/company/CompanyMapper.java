package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.BankAccountDto;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.CompanyBankAccount;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    @Mapping(target = "bankAccounts", ignore = true)
    @Mapping(target = "contactPersons", ignore = true)
    @Mapping(target = "role", expression = "java(companyDtoNew.role() != null ? ru.perminov.tender.model.company.CompanyRole.valueOf(companyDtoNew.role()) : null)")
    @Mapping(target = "sendNotifications", source = "sendNotifications")
    Company toCompany(CompanyDtoNew companyDtoNew);

    @Mapping(target = "bankDetails", source = "bankAccounts")
    @Mapping(target = "role", source = "role")
    @Mapping(target = "sendNotifications", source = "sendNotifications")
    CompanyDto toCompanyDto(Company company);

    @Mapping(target = "bankAccounts", ignore = true)
    @Mapping(target = "contactPersons", ignore = true)
    @Mapping(target = "role", expression = "java(companyDtoUpdate.role() != null ? ru.perminov.tender.model.company.CompanyRole.valueOf(companyDtoUpdate.role()) : company.getRole())")
    @Mapping(target = "sendNotifications", source = "sendNotifications")
    void updateCompanyFromDto(CompanyDtoUpdate companyDtoUpdate, @MappingTarget Company company);

    @Mapping(target = "bankDetails", source = "bankAccounts")
    CompanyDtoForUpdate toCompanyDtoForUpdate(Company company);

    default List<BankAccountDto> toBankAccountDtoList(List<CompanyBankAccount> entityList) {
        if (entityList == null) {
            return null;
        }
        return entityList.stream()
            .map(this::toBankAccountDto)
            .collect(Collectors.toList());
    }

    @Mapping(source = "bank.name", target = "bankName")
    @Mapping(source = "bank.bik", target = "bik")
    @Mapping(source = "bank.correspondentAccount", target = "correspondentAccount")
    @Mapping(source = "checkingAccount", target = "checkingAccount")
    BankAccountDto toBankAccountDto(CompanyBankAccount entity);
} 