package ru.perminov.tender.dto.tender;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class TenderSplitRequestDto {
    private UUID tenderId;
    private List<TenderItemSplitDto> itemSplits;
    
    @Data
    public static class TenderItemSplitDto {
        private UUID itemId;
        private Double splitQuantity; // Количество для отделения
        private String newItemDescription; // Описание для нового лота
    }
} 