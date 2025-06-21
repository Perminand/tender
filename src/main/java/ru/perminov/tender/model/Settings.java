package ru.perminov.tender.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "settings")
public class Settings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "setting_key", unique = true, nullable = false)
    private String key;
    
    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;
    
    @Column(name = "description")
    private String description;
    
    public Settings() {}
    
    public Settings(String key, String value, String description) {
        this.key = key;
        this.value = value;
        this.description = description;
    }
    
    // Геттеры и сеттеры
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getKey() {
        return key;
    }
    
    public void setKey(String key) {
        this.key = key;
    }
    
    public String getValue() {
        return value;
    }
    
    public void setValue(String value) {
        this.value = value;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
} 