package ru.perminov.tender.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.repository.TenderRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class TestController {

    private final RequestRepository requestRepository;
    private final TenderRepository tenderRepository;

    @GetMapping("/tenders")
    public ResponseEntity<Map<String, Object>> testTenders() {
        log.info("Тестирование данных тендеров");
        
        Map<String, Object> result = new HashMap<>();
        
        // Получаем все заявки
        List<Request> requests = requestRepository.findAll();
        result.put("totalRequests", requests.size());
        
        // Получаем все тендеры
        List<Tender> tenders = tenderRepository.findAll();
        result.put("totalTenders", tenders.size());
        
        // Проверяем связь заявок и тендеров
        Map<String, Object> requestTenderMapping = new HashMap<>();
        for (Request request : requests) {
            List<Tender> requestTenders = tenderRepository.findAllByRequestId(request.getId());
            
            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("requestId", request.getId());
            requestMap.put("tendersCount", requestTenders.size());
            
            List<Map<String, Object>> tenderList = requestTenders.stream().map(t -> {
                Map<String, Object> tenderMap = new HashMap<>();
                tenderMap.put("tenderId", t.getId());
                tenderMap.put("tenderNumber", t.getTenderNumber());
                tenderMap.put("title", t.getTitle());
                tenderMap.put("status", t.getStatus());
                return tenderMap;
            }).toList();
            
            requestMap.put("tenders", tenderList);
            requestTenderMapping.put(request.getRequestNumber(), requestMap);
        }
        result.put("requestTenderMapping", requestTenderMapping);
        
        log.info("Результат тестирования: {}", result);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/tenders/{requestId}")
    public ResponseEntity<Map<String, Object>> testTendersByRequest(@PathVariable UUID requestId) {
        log.info("Тестирование тендеров для заявки: {}", requestId);
        
        Map<String, Object> result = new HashMap<>();
        
        // Получаем заявку
        Request request = requestRepository.findById(requestId).orElse(null);
        if (request == null) {
            result.put("error", "Заявка не найдена");
            return ResponseEntity.ok(result);
        }
        
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("id", request.getId());
        requestMap.put("requestNumber", request.getRequestNumber());
        requestMap.put("date", request.getDate());
        result.put("request", requestMap);
        
        // Получаем тендеры для заявки
        List<Tender> tenders = tenderRepository.findAllByRequestId(requestId);
        result.put("tendersCount", tenders.size());
        
        List<Map<String, Object>> tenderDetails = tenders.stream().map(t -> {
            Map<String, Object> tenderMap = new HashMap<>();
            tenderMap.put("tenderId", t.getId());
            tenderMap.put("tenderNumber", t.getTenderNumber());
            tenderMap.put("title", t.getTitle());
            tenderMap.put("status", t.getStatus());
            tenderMap.put("startDate", t.getStartDate());
            tenderMap.put("itemsCount", t.getTenderItems().size());
            return tenderMap;
        }).toList();
        
        result.put("tenders", tenderDetails);
        
        log.info("Результат тестирования для заявки {}: {}", requestId, result);
        return ResponseEntity.ok(result);
    }
} 