package ru.perminov.tender.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HtmlWebBankResponseDto {
    private String name;
    @JsonProperty("ks")
    private String correspondentAccount;
    private String bic;
} 