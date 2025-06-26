package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.SupplierMaterialName;

import java.util.List;
import java.util.UUID;

public interface SupplierMaterialNameRepository extends JpaRepository<SupplierMaterialName, UUID> {
    List<SupplierMaterialName> findByMaterialId(UUID materialId);
    List<SupplierMaterialName> findBySupplierId(UUID supplierId);
    List<SupplierMaterialName> findByMaterialIdAndSupplierId(UUID materialId, UUID supplierId);
} 