package ru.perminov.tender.dto.tender;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class TenderSplitResponseDto {
    private UUID originalTenderId;
    private UUID newTenderId;
    private String newTenderNumber;
    private List<TenderItemDto> originalItems;
    private List<TenderItemDto> newItems;
    private String message;
} 