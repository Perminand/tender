package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.RequestRegistryRowDto;
import ru.perminov.tender.service.JwtService;
import ru.perminov.tender.service.RequestRegistryService;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/requests/registry")
@RequiredArgsConstructor
public class RequestRegistryController {
    private final RequestRegistryService registryService;
    private final JwtService jwtService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'VIEWER')")
    @GetMapping
    public ResponseEntity<List<RequestRegistryRowDto>> getRegistry(
            @RequestParam(required = false) String organization,
            @RequestParam(required = false) String project,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String materialName,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String companyId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"))) {
            String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
            if (token != null) {
                companyId = jwtService.extractClaim(token, claims -> claims.get("companyId", String.class));
            }
        }
        log.info("Получен GET-запрос: получить реестр заявок. Фильтры: организация={}, проект={}, с даты={}, по дату={}, материал={}",
                organization, project, fromDate, toDate, materialName);
        return ResponseEntity.ok(
                registryService.getRegistry(organization, project, fromDate, toDate, materialName, companyId)
        );
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportRegistry(
            @RequestParam(required = false) String organization,
            @RequestParam(required = false) String project,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String materialName
    ) {
        log.info("Получен GET-запрос: экспортировать реестр заявок в Excel. Фильтры: организация={}, проект={}, с даты={}, по дату={}, материал={}",
                organization, project,  fromDate, toDate, materialName);
        ByteArrayInputStream in = registryService.exportRegistryToExcel(organization, project, fromDate, toDate, materialName);
        byte[] bytes = in.readAllBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=registry.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
} 