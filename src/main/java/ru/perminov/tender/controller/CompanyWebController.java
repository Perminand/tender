package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.company.CompanyDtoNew;
import ru.perminov.tender.dto.company.CompanyDtoUpdate;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.CompanyType;
import ru.perminov.tender.service.company.CompanyService;
import ru.perminov.tender.service.company.CompanyTypeService;
import ru.perminov.tender.repository.company.ContactTypeRepository;
import ru.perminov.tender.mapper.company.CompanyMapper;

import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyWebController {

    private final CompanyService companyService;
    private final CompanyTypeService typeCompanyService;
    private final ContactTypeRepository contactTypeRepository;
    private final CompanyMapper companyMapper;

    @GetMapping
    public String listCompanies(Model model) {
        List<Company> companies = companyService.getAll();
        model.addAttribute("companies", companies);
        return "company/list";
    }

    @GetMapping("/new")
    public String newCompanyForm(Model model) {
        List<CompanyType> types = typeCompanyService.getAll();
        CompanyDtoNew company = new CompanyDtoNew(
            null, // uuid
            "", // inn
            "", // kpp
            "", // ogrn
            "", // name
            "",
                "",// address
            "", // typeName
            "", // director
            "", // phone
            "", // email
            "", // bankName
            "", // bankAccount
            "", // correspondentAccount
            "", // bik
            List.of() // contactPersons
        );
        model.addAttribute("company", company);
        model.addAttribute("types", types);
        model.addAttribute("contactTypes", contactTypeRepository.findAll());
        return "company/form";
    }

    @PostMapping
    public String createCompany(@ModelAttribute CompanyDtoNew companyDto) {
        companyService.create(companyDto);
        return "redirect:/companies";
    }

    @GetMapping("/{id}/edit")
    public String editCompanyForm(@PathVariable UUID id, Model model) {
        Company company = companyService.getById(id);
        List<CompanyType> types = typeCompanyService.getAll();
        CompanyDtoUpdate dto = companyMapper.toCompanyDtoUpdate(company);
        model.addAttribute("company", dto);
        model.addAttribute("types", types);
        model.addAttribute("contactTypes", contactTypeRepository.findAll());
        return "company/form";
    }

    @PostMapping("/{id}")
    public String updateCompany(@PathVariable UUID id, @ModelAttribute CompanyDtoUpdate companyDto) {
        companyService.update(id, companyDto);
        return "redirect:/companies";
    }

    @PostMapping("/{id}/delete")
    public String deleteCompany(@PathVariable UUID id) {
        companyService.delete(id);
        return "redirect:/companies";
    }
} 