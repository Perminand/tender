package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.model.TenderItemDeliveryOverride;
import ru.perminov.tender.service.TenderItemDeliveryOverrideService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tender-item-delivery")
@RequiredArgsConstructor
@Slf4j
public class TenderItemDeliveryOverrideController {

    private final TenderItemDeliveryOverrideService service;

    @PostMapping("/upsert")
    public ResponseEntity<TenderItemDeliveryOverride> upsert(@RequestBody Map<String, String> body) {
        UUID tenderItemId = UUID.fromString(body.get("tenderItemId"));
        UUID supplierId = UUID.fromString(body.get("supplierId"));
        BigDecimal amount = new BigDecimal(body.get("amount"));
        return ResponseEntity.ok(service.upsert(tenderItemId, supplierId, amount));
    }

    @PostMapping("/batch-upsert")
    public ResponseEntity<List<TenderItemDeliveryOverride>> batchUpsert(@RequestBody List<Map<String, String>> payload) {
        for (Map<String, String> row : payload) {
            UUID tenderItemId = UUID.fromString(row.get("tenderItemId"));
            UUID supplierId = UUID.fromString(row.get("supplierId"));
            BigDecimal amount = new BigDecimal(row.get("amount"));
            service.upsert(tenderItemId, supplierId, amount);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/by-items")
    public ResponseEntity<List<TenderItemDeliveryOverride>> getByItems(@RequestBody List<String> tenderItemIds) {
        List<UUID> ids = tenderItemIds.stream().map(UUID::fromString).toList();
        return ResponseEntity.ok(service.getByTenderItemIds(ids));
    }
}


