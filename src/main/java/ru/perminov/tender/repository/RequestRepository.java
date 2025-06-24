package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.perminov.tender.model.Request;

import java.util.UUID;

public interface RequestRepository extends JpaRepository<Request, UUID> {
} 