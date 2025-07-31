package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.dto.RequestRelatedEntitiesDto;
import ru.perminov.tender.service.RequestService;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;

@Slf4j
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping
    public ResponseEntity<List<RequestDto>> getAll() {
        log.info("Получен GET-запрос: получить все заявки");
        List<RequestDto> requests = requestService.findAll();
        log.info("Возвращено заявок: {}", requests.size());
        for (RequestDto request : requests) {
            log.info("Заявка {}: материалов = {}", request.id(), 
                    request.requestMaterials() != null ? request.requestMaterials().size() : 0);
        }
        return ResponseEntity.ok(requests);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping("/{id}")
    public ResponseEntity<RequestDto> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить заявку по id={}", id);
        return ResponseEntity.ok(requestService.findById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping("/test/{id}")
    public ResponseEntity<String> testById(@PathVariable UUID id) {
        log.info("Тестовый запрос для заявки id={}", id);
        try {
            RequestDto request = requestService.findById(id);
            String result = String.format("Заявка %s: материалов = %d", 
                    request.id(), 
                    request.requestMaterials() != null ? request.requestMaterials().size() : 0);
            log.info(result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Ошибка при получении заявки: ", e);
            return ResponseEntity.ok("Ошибка: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping("/{id}/status")
    public ResponseEntity<String> getStatus(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить статус заявки. id={}", id);
        try {
            RequestDto request = requestService.findById(id);
            log.info("Статус заявки {}: {}", id, request.status());
            return ResponseEntity.ok(request.status());
        } catch (Exception e) {
            log.error("Ошибка при получении статуса заявки: ", e);
            return ResponseEntity.ok("Ошибка: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @PostMapping
    public ResponseEntity<RequestDto> create(@Valid @RequestBody RequestDto dto) {
        log.info("Получен POST-запрос: создать заявку. Данные: {}", dto);
        return ResponseEntity.ok(requestService.create(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @PutMapping("/{id}")
    public ResponseEntity<RequestDto> update(@PathVariable UUID id, @Valid @RequestBody RequestDto dto) {
        log.info("Получен PUT-запрос: обновить заявку. id={}, данные: {}", id, dto);
        log.info("Данные заявки: {}", dto);
        if (dto.requestMaterials() != null) {
            log.info("Количество материалов: {}", dto.requestMaterials().size());
            for (int i = 0; i < dto.requestMaterials().size(); i++) {
                var material = dto.requestMaterials().get(i);
                log.info("Материал {}: id={}, materialLink={}, supplierMaterialName={}", 
                    i, material.id(), material.materialLink(), material.supplierMaterialName());
            }
        }
        try {
            return ResponseEntity.ok(requestService.update(id, dto));
        } catch (Exception e) {
            log.error("Ошибка при обновлении заявки: ", e);
            throw e;
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping("/{id}/related-entities")
    public ResponseEntity<RequestRelatedEntitiesDto> getRelatedEntities(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить связанные сущности заявки. id={}", id);
        RequestRelatedEntitiesDto relatedEntities = requestService.getRelatedEntities(id);
        log.info("Возвращены связанные сущности для заявки {}: тендеров={}, счетов={}", 
                id, relatedEntities.tenders().size(), relatedEntities.invoices().size());
        return ResponseEntity.ok(relatedEntities);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить заявку. id={}", id);
        try {
            requestService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            log.warn("Невозможно удалить заявку {}: {}", id, e.getMessage());
            RequestRelatedEntitiesDto relatedEntities = requestService.getRelatedEntities(id);
            return ResponseEntity.badRequest().body(relatedEntities);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @PostMapping("/{id}/create-tender")
    public ResponseEntity<ru.perminov.tender.dto.tender.TenderDto> createTenderFromRequest(@PathVariable UUID id) {
        log.info("Получен POST-запрос: создать тендер из заявки. id={}", id);
        try {
            ru.perminov.tender.dto.tender.TenderDto tender = requestService.createTenderFromRequest(id);
            log.info("Тендер успешно создан из заявки. tenderId={}", tender.getId());
            return ResponseEntity.ok(tender);
        } catch (Exception e) {
            log.error("Ошибка при создании тендера из заявки: ", e);
            throw e;
        }
    }
} 