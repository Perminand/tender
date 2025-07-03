package ru.perminov.tender.mapper;

import org.springframework.stereotype.Component;
import ru.perminov.tender.dto.CharacteristicDto;
import ru.perminov.tender.dto.OrgSupplierMaterialMappingDto;
import ru.perminov.tender.model.OrgSupplierMaterialMapping;

@Component
public class OrgSupplierMaterialMappingMapper {
    public OrgSupplierMaterialMappingDto toDto(OrgSupplierMaterialMapping entity) {
        if (entity == null) return null;
        return new OrgSupplierMaterialMappingDto(
            entity.getId(),
            entity.getOrganization() != null ? entity.getOrganization().getId() : null,
            entity.getOrganization() != null ? (
                entity.getOrganization().getLegalName() != null && !entity.getOrganization().getLegalName().isEmpty()
                    ? entity.getOrganization().getLegalName()
                    : (entity.getOrganization().getShortName() != null && !entity.getOrganization().getShortName().isEmpty()
                        ? entity.getOrganization().getShortName()
                        : entity.getOrganization().getName())
            ) : null,
            entity.getSupplierName(),
            entity.getMaterial() != null ? entity.getMaterial().getId() : null,
            entity.getMaterial() != null ? entity.getMaterial().getName() : null,
            entity.getCharacteristic() != null
                ? new CharacteristicDto(
                    entity.getCharacteristic().getId(),
                    entity.getCharacteristic().getName(),
                    entity.getCharacteristic().getDescription(),
                    entity.getCharacteristic().getCreatedAt(),
                    entity.getCharacteristic().getUpdatedAt()
                )
                : null
        );
    }
}
