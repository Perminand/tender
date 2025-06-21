package ru.perminov.tender.dto.fns;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FnsApiStatResponse(
    @JsonProperty("Методы")
    Map<String, MethodStat> methods
) {
} 