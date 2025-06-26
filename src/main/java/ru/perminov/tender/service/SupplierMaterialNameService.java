package ru.perminov.tender.service;

import ru.perminov.tender.model.SupplierMaterialName;
import java.util.List;
import java.util.UUID;
 
public interface SupplierMaterialNameService {
    SupplierMaterialName create(UUID materialId, UUID supplierId, String name);
    List<SupplierMaterialName> findByMaterial(UUID materialId);
    List<SupplierMaterialName> findBySupplier(UUID supplierId);
    List<SupplierMaterialName> findByMaterialAndSupplier(UUID materialId, UUID supplierId);
    List<SupplierMaterialName> findAll();
    void delete(UUID id);
} 