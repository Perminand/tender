package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.SupplierMaterialName;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.repository.SupplierMaterialNameRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.SupplierMaterialNameService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierMaterialNameServiceImpl implements SupplierMaterialNameService {
    private final SupplierMaterialNameRepository repository;
    private final MaterialRepository materialRepository;
    private final CompanyRepository companyRepository;

    @Override
    public SupplierMaterialName create(UUID materialId, UUID supplierId, String name) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Material not found"));
        Company supplier = companyRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        
        SupplierMaterialName entity = new SupplierMaterialName();
        entity.setMaterial(material);
        entity.setSupplier(supplier);
        entity.setName(name);
        return repository.save(entity);
    }

    @Override
    public List<SupplierMaterialName> findByMaterial(UUID materialId) {
        return repository.findByMaterialId(materialId);
    }

    @Override
    public List<SupplierMaterialName> findBySupplier(UUID supplierId) {
        return repository.findBySupplierId(supplierId);
    }

    @Override
    public List<SupplierMaterialName> findByMaterialAndSupplier(UUID materialId, UUID supplierId) {
        return repository.findByMaterialIdAndSupplierId(materialId, supplierId);
    }

    @Override
    public List<SupplierMaterialName> findAll() {
        return repository.findAll();
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }
} 