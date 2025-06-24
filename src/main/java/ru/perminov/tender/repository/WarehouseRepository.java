package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.Warehouse;

import java.util.UUID;

public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {
} 