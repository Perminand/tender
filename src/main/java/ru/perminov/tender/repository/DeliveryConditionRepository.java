package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.DeliveryCondition;

import java.util.UUID;
import java.util.List;

@Repository
public interface DeliveryConditionRepository extends JpaRepository<DeliveryCondition, UUID> {
    @Query("select distinct d.deliveryType from DeliveryCondition d")
    List<DeliveryCondition.DeliveryType> findDistinctDeliveryTypes();
}
