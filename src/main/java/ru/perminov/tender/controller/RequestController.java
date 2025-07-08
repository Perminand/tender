package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.service.RequestService;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class RequestController {
    private final RequestService requestService;

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

    @GetMapping("/{id}")
    public ResponseEntity<RequestDto> getById(@PathVariable UUID id) {
        log.info("Получен GET-запрос: получить заявку по id={}", id);
        return ResponseEntity.ok(requestService.findById(id));
    }

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

    @PostMapping
    public ResponseEntity<RequestDto> create(@Valid @RequestBody RequestDto dto) {
        log.info("Получен POST-запрос: создать заявку. Данные: {}", dto);
        return ResponseEntity.ok(requestService.create(dto));
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Получен DELETE-запрос: удалить заявку. id={}", id);
        requestService.delete(id);
        return ResponseEntity.noContent().build();
    }

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