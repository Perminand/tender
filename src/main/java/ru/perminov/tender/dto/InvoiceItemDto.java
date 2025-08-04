package ru.perminov.tender.dto;

import lombok.Data;
import ru.perminov.tender.model.InvoiceItem;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class InvoiceItemDto {
    private UUID id;
    private UUID invoiceId;
    private UUID materialId;
    private String materialName;
    private String description;
    private BigDecimal quantity;
    private UUID unitId;
    private String unitName;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
    private String notes;

    public static InvoiceItemDto fromEntity(InvoiceItem item) {
        InvoiceItemDto dto = new InvoiceItemDto();
        dto.setId(item.getId());
        dto.setInvoiceId(item.getInvoice().getId());
        
        if (item.getMaterial() != null) {
            dto.setMaterialId(item.getMaterial().getId());
            dto.setMaterialName(item.getMaterial().getName());
        }
        
        dto.setDescription(item.getDescription());
        dto.setQuantity(item.getQuantity());
        
        if (item.getUnit() != null) {
            dto.setUnitId(item.getUnit().getId());
            dto.setUnitName(item.getUnit().getName());
        }
        
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        dto.setVatRate(item.getVatRate());
        dto.setVatAmount(item.getVatAmount());
        dto.setNotes(item.getNotes());
        
        return dto;
    }
} 