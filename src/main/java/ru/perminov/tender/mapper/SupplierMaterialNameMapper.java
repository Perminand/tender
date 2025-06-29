package ru.perminov.tender.mapper;

import org.springframework.stereotype.Component;
import ru.perminov.tender.dto.SupplierMaterialNameDto;
import ru.perminov.tender.model.SupplierMaterialName;

@Component
public class SupplierMaterialNameMapper {
    public SupplierMaterialNameDto toDto(SupplierMaterialName entity) {
        if (entity == null) return null;
        return new SupplierMaterialNameDto(
            entity.getId(),
            entity.getName(),
            entity.getMaterial() != null ? entity.getMaterial().getId() : null,
            entity.getMaterial() != null ? entity.getMaterial().getName() : null,
            entity.getSupplier() != null ? entity.getSupplier().getId() : null,
            entity.getSupplier() != null ? entity.getSupplier().getName() : null
        );
    }
} 