package ru.perminov.tender.service.company.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.company.BankAccountDto;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.CompanyDtoForUpdate;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.dto.company.contact.ContactDetailsDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDetailsDto;
import ru.perminov.tender.mapper.company.CompanyMapper;
import ru.perminov.tender.mapper.company.ContactPersonMapper;
import ru.perminov.tender.model.company.Bank;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.CompanyBankAccount;
import ru.perminov.tender.model.company.CompanyType;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.BankRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.company.CompanyTypeRepository;
import ru.perminov.tender.repository.company.ContactPersonRepository;
import ru.perminov.tender.repository.company.ContactRepository;
import ru.perminov.tender.repository.company.ContactTypeRepository;
import ru.perminov.tender.service.company.CompanyService;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyTypeRepository typeCompanyRepository;
    private final ContactTypeRepository contactTypeRepository;
    private final CompanyMapper companyMapper;
    private final ContactPersonMapper contactPersonMapper;
    private final ContactPersonRepository contactPersonRepository;
    private final ContactRepository contactRepository;
    private final BankRepository bankRepository;

    @Override
    @Transactional
    public CompanyDto create(CompanyDtoNew companyDtoNew) {
        Company company = companyMapper.toCompany(companyDtoNew);

        // Устанавливаем тип компании
        CompanyType companyType = typeCompanyRepository.findById(UUID.fromString(companyDtoNew.typeId()))
                .orElseThrow(() -> new IllegalArgumentException("CompanyType not found with id: " + companyDtoNew.typeId()));
        company.setCompanyType(companyType);

        // Обработка банковских счетов
        if (companyDtoNew.bankDetails() != null && !companyDtoNew.bankDetails().isEmpty()) {
            List<CompanyBankAccount> accounts = processBankAccounts(companyDtoNew.bankDetails(), company);
            company.setBankAccounts(accounts);
        }

        // Устанавливаем контактных лиц
        if (companyDtoNew.contactPersons() != null && !companyDtoNew.contactPersons().isEmpty()) {
            company.setContactPersons(
                companyDtoNew.contactPersons().stream().map(personDto -> {
                    ContactPerson person = contactPersonMapper.toContactPerson(personDto);
                    person.setCompany(company);
                    processAndSetContacts(person, personDto.contacts());
                    return person;
                }).collect(Collectors.toList())
            );
        }

        return companyMapper.toCompanyDto(companyRepository.save(company));
    }

    @Override
    @Transactional
    public CompanyDto update(UUID id, CompanyDtoUpdate companyDtoUpdate) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        companyMapper.updateCompanyFromDto(companyDtoUpdate, company);

        // Обработка банковских счетов
        if (companyDtoUpdate.bankDetails() != null) {
            company.getBankAccounts().clear();
            List<CompanyBankAccount> accounts = processBankAccounts(companyDtoUpdate.bankDetails(), company);
            company.getBankAccounts().addAll(accounts);
        }

        if (companyDtoUpdate.contactPersons() != null) {
            // Сначала удаляем старых контактных лиц, чтобы избежать дубликатов и orhpaned entities
            contactPersonRepository.deleteAll(company.getContactPersons());
            company.getContactPersons().clear();

            // Создаем и добавляем новых
            List<ContactPerson> newContactPersons = companyDtoUpdate.contactPersons().stream().map(personDto -> {
                ContactPerson person = contactPersonMapper.toContactPerson(personDto);
                person.setCompany(company);
                processAndSetContacts(person, personDto.contacts());
                return person;
            }).toList();

            company.getContactPersons().addAll(newContactPersons);
        }

        return companyMapper.toCompanyDto(companyRepository.save(company));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        companyRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDtoForUpdate getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));
        return companyMapper.toCompanyDtoForUpdate(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto> getAll() {
        return companyRepository.findAll().stream()
                .map(companyMapper::toCompanyDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDto getByShortName(String shortName) {
        Company company = companyRepository.findByShortName(shortName)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with shortName: " + shortName));
        return companyMapper.toCompanyDto(company);
    }

    public static class ImportResult {
        public int imported;
        public java.util.List<Map<String, Object>> errors = new ArrayList<>();
    }

    @Override
    @Transactional
    public ImportResult importFromExcel(org.springframework.web.multipart.MultipartFile file) {
        ImportResult result = new ImportResult();
        try (java.io.InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // пропускаем header
                Row row = sheet.getRow(i);
                if (row == null) continue;
                try {
                    String inn = getCellStringValue(row.getCell(1));
                    if (inn == null || inn.isBlank()) throw new RuntimeException("Пустой ИНН");
                    if (companyRepository.findByInn(inn).isPresent()) throw new RuntimeException("Компания с таким ИНН уже существует");
                    String kpp = getCellStringValue(row.getCell(2));
                    String ogrn = getCellStringValue(row.getCell(3));
                    String name = getCellStringValue(row.getCell(4));
                    String legalName = getCellStringValue(row.getCell(5));
                    String shortName = getCellStringValue(row.getCell(6));
                    String address = getCellStringValue(row.getCell(7));
                    String typeName = getCellStringValue(row.getCell(8));
                    String director = getCellStringValue(row.getCell(9));
                    String phone = getCellStringValue(row.getCell(10));
                    String email = getCellStringValue(row.getCell(11));

                    if (typeName == null || typeName.isBlank()) throw new RuntimeException("Тип компании не указан");
                    CompanyType companyType = typeCompanyRepository.findByName(typeName)
                        .orElseGet(() -> typeCompanyRepository.save(new CompanyType(null, typeName)));

                    Company company = new Company();
                    company.setInn(inn);
                    company.setKpp(kpp);
                    company.setOgrn(ogrn);
                    company.setName(name);
                    company.setLegalName(legalName);
                    company.setShortName(shortName);
                    company.setAddress(address);
                    company.setCompanyType(companyType);
                    company.setDirector(director);
                    company.setPhone(phone);
                    company.setEmail(email);
                    companyRepository.save(company);
                    result.imported++;
                } catch (Exception e) {
                    Map<String, Object> err = new HashMap<>();
                    err.put("row", i + 1); // Excel строки с 1, а не с 0
                    err.put("message", e.getMessage());
                    result.errors.add(err);
                }
            }
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("row", 0);
            err.put("message", "Ошибка файла: " + e.getMessage());
            result.errors.add(err);
        }
        return result;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                double d = cell.getNumericCellValue();
                if (d == (long) d) {
                    return String.valueOf((long) d);
                } else {
                    return String.valueOf(d);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return cell.toString();
        }
    }

    private CompanyType createOrUpdateType(CompanyDtoNew dto) {
        if (dto.typeId().equals("new")) {
            return typeCompanyRepository.save(new CompanyType(null, dto.typeName()));
        } else {
            return typeCompanyRepository.findById(UUID.fromString(dto.typeId()))
                    .orElseGet(() -> {
                        CompanyType newType = new CompanyType(null, dto.typeName());
                        return typeCompanyRepository.save(newType);
                    });
        }
    }

    private List<CompanyBankAccount> processBankAccounts(List<BankAccountDto> accountDtos, Company company) {
        return accountDtos.stream().map(dto -> {
            Bank bank = bankRepository.findById(dto.getBik())
                .orElseGet(() -> {
                    Bank newBank = new Bank(dto.getBik(), dto.getBankName(), dto.getCorrespondentAccount());
                    return bankRepository.save(newBank);
                });

            CompanyBankAccount account = new CompanyBankAccount();
            account.setCompany(company);
            account.setBank(bank);
            account.setCheckingAccount(dto.getCheckingAccount());
            return account;
        }).collect(Collectors.toList());
    }

    private void processAndSetContacts(ContactPerson contactPerson, List<ContactDetailsDto> contactDtos) {
        if (contactDtos == null || contactDtos.isEmpty()) {
            return;
        }

        for (ContactDetailsDto contactDto : contactDtos) {
            Contact contact = new Contact();
            contact.setValue(contactDto.value());
            contact.setContactPerson(contactPerson);

            ContactTypeDetailsDto typeDto = contactDto.contactType();
            if (typeDto != null) {
                ContactType contactType = null;
                // Сначала пытаемся найти по ID, если он есть
                if (typeDto.id() != null) {
                    contactType = contactTypeRepository.findById(typeDto.id())
                        .orElse(null); // Не кидаем ошибку, а пробуем найти по имени
                }
                
                // Если по ID не нашли, но есть имя, ищем по имени или создаем новый
                if (contactType == null && typeDto.name() != null && !typeDto.name().isBlank()) {
                    contactType = contactTypeRepository.findByName(typeDto.name())
                        .orElseGet(() -> {
                            ContactType newType = new ContactType();
                            newType.setName(typeDto.name());
                            return contactTypeRepository.save(newType);
                        });
                }
                contact.setContactType(contactType);
            }
            contactPerson.getContacts().add(contact);
        }
    }
} 