package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.RequestRegistryRowDto;
import ru.perminov.tender.service.RequestRegistryService;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/requests/registry")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class RequestRegistryController {
    private final RequestRegistryService registryService;

    @GetMapping
    public ResponseEntity<List<RequestRegistryRowDto>> getRegistry(
            @RequestParam(required = false) String organization,
            @RequestParam(required = false) String project,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String materialName
    ) {
        return ResponseEntity.ok(
                registryService.getRegistry(organization, project, status, fromDate, toDate, materialName)
        );
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportRegistry(
            @RequestParam(required = false) String organization,
            @RequestParam(required = false) String project,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String materialName
    ) {
        ByteArrayInputStream in = registryService.exportRegistryToExcel(organization, project, status, fromDate, toDate, materialName);
        byte[] bytes = in.readAllBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=registry.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
} 