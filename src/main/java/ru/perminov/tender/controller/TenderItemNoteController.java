package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.tender.TenderItemNoteDto;
import ru.perminov.tender.service.TenderItemNoteService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tender-item-notes")
@RequiredArgsConstructor
@Slf4j
public class TenderItemNoteController {

    private final TenderItemNoteService service;

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/{tenderItemId}/{supplierId}")
    public ResponseEntity<TenderItemNoteDto> get(@PathVariable UUID tenderItemId, @PathVariable UUID supplierId) {
        TenderItemNoteDto dto = service.get(tenderItemId, supplierId);
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/{tenderItemId}/{supplierId}")
    public ResponseEntity<TenderItemNoteDto> upsert(@PathVariable UUID tenderItemId,
                                                    @PathVariable UUID supplierId,
                                                    @RequestBody Map<String, String> body) {
        String note = body.getOrDefault("note", "");
        TenderItemNoteDto dto = service.upsert(tenderItemId, supplierId, note);
        return ResponseEntity.ok(dto);
    }
}


