package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import ru.perminov.tender.dto.customer.CustomerInfoDto;
import ru.perminov.tender.dto.customer.CustomerSummaryDto;
import ru.perminov.tender.dto.customer.CustomerHierarchyDto;
import ru.perminov.tender.service.CustomerInfoService;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/customer-info")
@RequiredArgsConstructor
public class CustomerInfoController {
    
    private final CustomerInfoService customerInfoService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping("/summary")
    public ResponseEntity<List<CustomerSummaryDto>> getCustomerSummary() {
        log.info("Получен GET-запрос: получить сводку по заказчикам");
        return ResponseEntity.ok(customerInfoService.getCustomerSummary());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping("/hierarchy")
    public ResponseEntity<List<CustomerHierarchyDto>> getCustomerHierarchy() {
        log.info("Получен GET-запрос: получить иерархическую сводку по заказчикам");
        return ResponseEntity.ok(customerInfoService.getCustomerHierarchy());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerInfoDto> getCustomerInfo(@PathVariable UUID customerId) {
        log.info("Получен GET-запрос: получить детальную информацию по заказчику customerId={}", customerId);
        return ResponseEntity.ok(customerInfoService.getCustomerInfo(customerId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping("/request/{requestNumber}")
    public ResponseEntity<CustomerInfoDto> getCustomerInfoByRequest(@PathVariable String requestNumber) {
        log.info("Получен GET-запрос: получить информацию по заказчику через заявку requestNumber={}", requestNumber);
        return ResponseEntity.ok(customerInfoService.getCustomerInfoByRequestNumber(requestNumber));
    }
} 