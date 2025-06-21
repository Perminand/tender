package ru.perminov.tender.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ru.perminov.tender.service.FnsService;
import ru.perminov.tender.service.SettingsService;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FnsServiceImpl implements FnsService {

    private final SettingsService settingsService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public Map<String, Object> searchCompany(String inn) {
        try {
            // Получаем API ключ из настроек
            String apiKey = settingsService.getFnsApiKey();
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("API ключ ФНС не настроен");
            }
            apiKey = cleanApiKey(apiKey);

            // 1. Сначала делаем поиск по ИНН
            String searchUrl = "https://api-fns.ru/api/search?q=" + inn + "&key=" + apiKey;
            log.info("Выполняем поиск контрагента по ИНН: {}", inn);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            
            ResponseEntity<String> searchResponse = restTemplate.exchange(
                searchUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            JsonNode searchData = objectMapper.readTree(searchResponse.getBody());
            log.info("Ответ от API ФНС (поиск): {}", searchResponse.getBody());

            if (!searchData.has("items") || !searchData.get("items").isArray() || searchData.get("items").isEmpty()) {
                throw new RuntimeException("Контрагент с ИНН " + inn + " не найден");
            }
            JsonNode searchItem = searchData.get("items").get(0);

            // 2. Теперь получаем подробную информацию через /egr
            String egrUrl = "https://api-fns.ru/api/egr?req=" + inn + "&key=" + apiKey;
            log.info("Получаем подробную информацию о контрагенте");
            
            ResponseEntity<String> egrResponse = restTemplate.exchange(
                egrUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            JsonNode egrData = objectMapper.readTree(egrResponse.getBody());
            log.info("Ответ от API ФНС (ЕГР): {}", egrResponse.getBody());

            Map<String, Object> result = new HashMap<>();
            boolean egrHasData = egrData.has("items") && egrData.get("items").isArray() && !egrData.get("items").isEmpty();

            if (egrHasData) {
                JsonNode egrItem = egrData.get("items").get(0);
                if (egrItem.has("ЮЛ")) {
                    parseYurLico(result, egrItem.get("ЮЛ"));
                } else if (egrItem.has("ИП")) {
                    parseIp(result, egrItem.get("ИП"));
                } else {
                    log.warn("Не удалось определить ЮЛ/ИП в /egr ответе, используем данные из /search");
                    parseFromSearchItem(result, searchItem);
                }
            } else {
                log.warn("Ответ от /egr пуст, используем данные из /search");
                parseFromSearchItem(result, searchItem);
            }
            
            return result;

        } catch (Exception e) {
            log.error("Ошибка при поиске компании по ИНН: {}", inn, e);
            throw new RuntimeException("Ошибка при получении данных о компании: " + e.getMessage());
        }
    }

    private void parseFromSearchItem(Map<String, Object> result, JsonNode searchItem) {
        if (searchItem.has("ЮЛ")) {
            JsonNode yul = searchItem.get("ЮЛ");
            result.put("name", getJsonText(yul, "НаимПолнЮЛ"));
            result.put("shortName", getJsonText(yul, "НаимСокрЮЛ"));
            result.put("inn", getJsonText(yul, "ИНН"));
            result.put("ogrn", getJsonText(yul, "ОГРН"));
            result.put("head", getJsonText(yul, "Руководитель", "ФИОПолн"));
            result.put("address", getJsonText(yul, "АдресПолн"));
            result.put("kpp", getJsonText(yul, "КПП"));
            result.put("legalForm", "Юридическое лицо"); // Fallback
        } else if (searchItem.has("ИП")) {
            JsonNode ip = searchItem.get("ИП");
            String fullName = getJsonText(ip, "ФИОПолн");
            result.put("name", fullName);
            result.put("shortName", "ИП " + fullName);
            result.put("inn", getJsonText(ip, "ИНН"));
            result.put("ogrn", getJsonText(ip, "ОГРНИП"));
            result.put("head", fullName);
            result.put("address", ""); // Not in search result for ИП
            result.put("kpp", "");
            result.put("legalForm", "Индивидуальный предприниматель");
        }
    }

    private void parseYurLico(Map<String, Object> result, JsonNode company) {
        result.put("name", getJsonText(company, "НаимПолнЮЛ"));
        result.put("shortName", getJsonText(company, "НаимСокрЮЛ"));
        result.put("inn", getJsonText(company, "ИНН"));
        result.put("kpp", getJsonText(company, "КПП"));
        result.put("ogrn", getJsonText(company, "ОГРН"));
        result.put("ogrnDate", getJsonText(company, "ДатаРег"));
        result.put("legalForm", getJsonText(company, "ОКОПФ"));
        result.put("address", getJsonText(company, "Адрес", "АдресПолн"));
        result.put("head", getJsonText(company, "Руководитель", "ФИОПолн"));
        
        JsonNode contacts = company.get("Контакты");
        if (contacts != null && contacts.isObject()) {
            result.put("phone", getFirstInJsonArray(contacts, "Телефон"));
            result.put("email", getFirstInJsonArray(contacts, "e-mail"));
        } else {
             result.put("phone", "");
             result.put("email", "");
        }
    }

    private void parseIp(Map<String, Object> result, JsonNode ip) {
        String fullName = getJsonText(ip, "ФИОПолн");
        result.put("name", fullName);
        result.put("shortName", "ИП " + getJsonText(ip, "ФИОСокр"));
        result.put("inn", getJsonText(ip, "ИННФЛ"));
        result.put("kpp", ""); // ИП has no KPP
        result.put("ogrn", getJsonText(ip, "ОГРНИП"));
        result.put("ogrnDate", getJsonText(ip, "ДатаОГРН"));
        result.put("legalForm", "Индивидуальный предприниматель");
        result.put("address", getJsonText(ip, "Адрес", "АдресПолн"));
        result.put("head", fullName); // Head is the person themselves

        JsonNode contacts = ip.get("Контакты");
        if (contacts != null && contacts.isObject()) {
            result.put("phone", getFirstInJsonArray(contacts, "Телефон"));
            result.put("email", getFirstInJsonArray(contacts, "e-mail"));
        } else {
             result.put("phone", "");
             result.put("email", "");
        }
    }

    private String cleanApiKey(String apiKey) {
        if (apiKey != null) {
            return apiKey.trim().replaceAll("^\"|\"$", "");
        }
        return apiKey;
    }

    private String getJsonText(JsonNode node, String fieldName) {
        if (node != null && node.has(fieldName) && node.get(fieldName).isTextual()) {
            return node.get(fieldName).asText("");
        }
        return "";
    }

    private String getJsonText(JsonNode node, String objectName, String fieldName) {
        if (node != null && node.has(objectName) && node.get(objectName).isObject()) {
            JsonNode childNode = node.get(objectName);
            return getJsonText(childNode, fieldName);
        }
        return "";
    }

    private String getFirstInJsonArray(JsonNode node, String arrayName) {
        if (node != null && node.has(arrayName) && node.get(arrayName).isArray() && !node.get(arrayName).isEmpty()) {
            return node.get(arrayName).get(0).asText("");
        }
        return "";
    }
} 