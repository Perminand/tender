package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.service.RequestService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"})
public class RequestController {
    private final RequestService requestService;

    @GetMapping
    public ResponseEntity<List<RequestDto>> getAll() {
        return ResponseEntity.ok(requestService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(requestService.findById(id));
    }

    @PostMapping
    public ResponseEntity<RequestDto> create(@RequestBody RequestDto dto) {
        return ResponseEntity.ok(requestService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequestDto> update(@PathVariable UUID id, @RequestBody RequestDto dto) {
        return ResponseEntity.ok(requestService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        requestService.delete(id);
        return ResponseEntity.noContent().build();
    }
} 