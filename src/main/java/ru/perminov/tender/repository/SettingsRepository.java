package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.Settings;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, UUID> {
    
    Optional<Settings> findByKey(String key);
    
    @Query("SELECT s.value FROM Settings s WHERE s.key = :key")
    Optional<String> findValueByKey(@Param("key") String key);
    
    boolean existsByKey(String key);
} 