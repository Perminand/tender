package ru.perminov.tender.dto;

import lombok.Data;

@Data
public class StatusChangeRequest {
    private String status;
    private String comment;
} 