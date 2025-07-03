package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.perminov.tender.model.Request;

import java.util.Optional;
import java.util.UUID;

public interface RequestRepository extends JpaRepository<Request, UUID> {
    
    @Query("SELECT r FROM Request r " +
           "LEFT JOIN FETCH r.requestMaterials rm " +
           "LEFT JOIN FETCH rm.material " +
           "LEFT JOIN FETCH rm.unit " +
           "LEFT JOIN FETCH r.organization " +
           "LEFT JOIN FETCH r.project " +
           "WHERE r.id = :id")
    Optional<Request> findByIdWithMaterials(@Param("id") UUID id);
    
    @Query("SELECT r FROM Request r " +
           "LEFT JOIN FETCH r.requestMaterials rm " +
           "LEFT JOIN FETCH rm.material " +
           "LEFT JOIN FETCH rm.unit " +
           "LEFT JOIN FETCH r.organization " +
           "LEFT JOIN FETCH r.project")
    java.util.List<Request> findAllWithMaterials();
} 