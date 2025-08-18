package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.DeliveryCondition;

import java.util.UUID;

@Repository
public interface DeliveryConditionRepository extends JpaRepository<DeliveryCondition, UUID> {
}
