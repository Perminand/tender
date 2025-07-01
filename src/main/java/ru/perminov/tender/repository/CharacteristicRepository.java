package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.Characteristic;
import java.util.UUID;
 
public interface CharacteristicRepository extends JpaRepository<Characteristic, UUID> {
} 