package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.DeliveryType;

import java.util.UUID;

@Repository
public interface DeliveryTypeRepository extends JpaRepository<DeliveryType, UUID> {
    boolean existsByName(String name);
}


