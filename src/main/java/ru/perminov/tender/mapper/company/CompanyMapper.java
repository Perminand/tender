package ru.perminov.tender.mapper.company;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.company.BankDetailsDto;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.company.BankDetails;
import ru.perminov.tender.model.company.Company;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ContactPersonMapper.class})
public interface CompanyMapper {
    
    @Mapping(target = "companyType", ignore = true)
    @Mapping(target = "contactPersons", ignore = true)
    Company toCompany(CompanyDtoNew dto);

    @Mapping(target = "companyType", ignore = true)
    @Mapping(target = "contactPersons", source = "contactPersons")
    @Mapping(target = "id", ignore = true)
    void updateCompanyFromDto(CompanyDtoUpdate dto, @MappingTarget Company company);

    @Mapping(target = "typeId", source = "companyType.id")
    @Mapping(target = "typeName", source = "companyType.name")
    @Mapping(target = "director", source = "director")
    CompanyDto toCompanyDto(Company company);

    @Mapping(target = "companyType", source = "companyType")
    @Mapping(target = "director", source = "director")
    CompanyDtoForUpdate toCompanyDtoForUpdate(Company company);

    // Маппинг для банковских реквизитов
    BankDetails toBankDetails(BankDetailsDto dto);
    BankDetailsDto toBankDetailsDto(BankDetails entity);
    List<BankDetails> toBankDetailsList(List<BankDetailsDto> dtoList);
    List<BankDetailsDto> toBankDetailsDtoList(List<BankDetails> entityList);
}