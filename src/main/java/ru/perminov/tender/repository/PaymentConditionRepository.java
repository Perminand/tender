package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.PaymentCondition;

import java.util.UUID;

@Repository
public interface PaymentConditionRepository extends JpaRepository<PaymentCondition, UUID> {
}
