package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.dto.contract.ContractDtoNew;
import ru.perminov.tender.dto.contract.ContractDtoUpdate;
import ru.perminov.tender.dto.contract.ContractItemDto;
import ru.perminov.tender.service.ContractService;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@Slf4j
public class ContractController {
    private final ContractService contractService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}")
    public ResponseEntity<ContractDto> getContractById(@PathVariable UUID id) {
        log.info("Получение контракта по id: {}", id);
        ContractDto dto = contractService.getContractById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<ContractDto>> getAllContracts() {

        log.info("Получение всех контрактов");
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ContractDto>> getContractsByStatus(@PathVariable String status) {
        log.info("Получение контрактов по статусу: {}", status);
        return ResponseEntity.ok(contractService.getContractsByStatus(status));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<ContractDto>> getContractsBySupplier(@PathVariable UUID supplierId) {
        log.info("Получение контрактов по поставщику: {}", supplierId);
        return ResponseEntity.ok(contractService.getContractsBySupplier(supplierId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ContractDto> updateContract(@PathVariable UUID id, @RequestBody ContractDtoUpdate contractDtoUpdate) {
        log.info("Обновление контракта id {}: {}", id, contractDtoUpdate);
        ContractDto dto = contractService.updateContract(id, contractDtoUpdate);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable UUID id) {
        log.info("Удаление контракта id {}", id);
        contractService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ContractDto> changeContractStatus(@PathVariable UUID id, @RequestParam String status) {
        log.info("Изменение статуса контракта id {} на {}", id, status);
        ContractDto dto = contractService.changeContractStatus(id, status);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    @GetMapping("/{id}/items")
    public ResponseEntity<List<ContractItemDto>> getContractItems(@PathVariable UUID id) {
        log.info("Получение позиций контракта id {}", id);
        return ResponseEntity.ok(contractService.getContractItems(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/from-tender")
    public ResponseEntity<ContractDto> createContractFromTender(@RequestBody ContractDtoNew contractDtoNew) {
        log.info("Создание контракта на основе тендера и поставщика через тело запроса: {}", contractDtoNew);
        try {
            ContractDto dto = contractService.createContractFromTender(contractDtoNew);
            if (dto == null) {
                // Нет выигравших позиций — считаем это мягким исходом
                log.warn("Контракт не создан: нет выигравших позиций для supplierId={} в tenderId={}",
                        contractDtoNew.supplierId(), contractDtoNew.tenderId());
                return ResponseEntity.noContent().build();
            }
            log.info("Контракт успешно создан из тендера. contractId={}, tenderId={}",
                    dto.getId(), contractDtoNew.tenderId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Ошибка при создании контракта из тендера: tenderId={}, ошибка: {}",
                    contractDtoNew.tenderId(), e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER', 'CUSTOMER')")
    @GetMapping("/status-stats")
    public ResponseEntity<Map<String, Long>> getStatusStats() {
        return ResponseEntity.ok(contractService.getStatusStats());
    }
} 