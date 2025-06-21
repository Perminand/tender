package ru.perminov.tender.dto.fns;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MethodStat(
    @JsonProperty("Лимит")
    String limit,
    @JsonProperty("Истрачено")
    String used
) {
}