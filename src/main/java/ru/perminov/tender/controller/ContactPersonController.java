package ru.perminov.tender.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoNew;
import ru.perminov.tender.dto.company.contact.ContactPersonDtoUpdate;
import ru.perminov.tender.service.company.CompanyService;
import ru.perminov.tender.service.company.ContactPersonService;
import ru.perminov.tender.repository.company.ContactTypeRepository;

import java.util.ArrayList;
import java.util.UUID;

@Slf4j
@Controller
@RequestMapping("/contact-persons")
@RequiredArgsConstructor
public class ContactPersonController {

    private final ContactPersonService contactPersonService;
    private final CompanyService companyService;
    private final ContactTypeRepository contactTypeRepository;

    @GetMapping
    public String list(Model model) {
        log.info("Получен GET-запрос: отобразить список контактных лиц");
        model.addAttribute("contactPersons", contactPersonService.getAll());
        return "contact-person/list";
    }

    @GetMapping("/new")
    public String newForm(Model model) {
        log.info("Получен GET-запрос: отобразить форму создания контактного лица");
        model.addAttribute("contactPerson", new ContactPersonDtoNew(null, null, null, null, null, null));
        model.addAttribute("companies", companyService.getAll());
        model.addAttribute("contactTypes", contactTypeRepository.findAll());
        return "contact-person/form";
    }

    @PostMapping
    public String create(@Valid @ModelAttribute("contactPerson") ContactPersonDtoNew contactPerson,
                        BindingResult bindingResult,
                        Model model,
                        RedirectAttributes redirectAttributes) {
        log.info("Получен POST-запрос: создать контактное лицо. Данные: {}", contactPerson);
        if (bindingResult.hasErrors()) {
            model.addAttribute("companies", companyService.getAll());
            model.addAttribute("contactTypes", contactTypeRepository.findAll());
            return "contact-person/form";
        }

        contactPersonService.create(contactPerson);
        redirectAttributes.addFlashAttribute("success", "Контактное лицо успешно создано");
        return "redirect:/contact-persons";
    }

    @GetMapping("/{uuid}/edit")
    public String editForm(@PathVariable UUID uuid, Model model) {
        log.info("Получен GET-запрос: отобразить форму редактирования контактного лица. uuid={}", uuid);
        model.addAttribute("contactPerson", contactPersonService.findByUuid(uuid));
        model.addAttribute("companies", companyService.getAll());
        model.addAttribute("contactTypes", contactTypeRepository.findAll());
        return "contact-person/form";
    }

    @PostMapping("/{uuid}")
    public String update(@PathVariable UUID uuid,
                        @Valid @ModelAttribute("contactPerson") ContactPersonDtoUpdate contactPerson,
                        BindingResult bindingResult,
                        Model model,
                        RedirectAttributes redirectAttributes) {
        log.info("Получен POST-запрос: обновить контактное лицо. uuid={}, данные: {}", uuid, contactPerson);
        if (bindingResult.hasErrors()) {
            model.addAttribute("companies", companyService.getAll());
            model.addAttribute("contactTypes", contactTypeRepository.findAll());
            return "contact-person/form";
        }

        contactPersonService.update(uuid, contactPerson);
        redirectAttributes.addFlashAttribute("success", "Контактное лицо успешно обновлено");
        return "redirect:/contact-persons";
    }

    @PostMapping("/{uuid}/delete")
    public String delete(@PathVariable UUID uuid, RedirectAttributes redirectAttributes) {
        log.info("Получен POST-запрос: удалить контактное лицо. uuid={}", uuid);
        contactPersonService.delete(uuid);
        redirectAttributes.addFlashAttribute("success", "Контактное лицо успешно удалено");
        return "redirect:/contact-persons";
    }
} 