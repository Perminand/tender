package ru.perminov.tender.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import ru.perminov.tender.dto.CategoryDto;
import ru.perminov.tender.dto.MaterialTypeDto;
import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.model.Unit;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class MaterialMapperTest {

    @Autowired
    private MaterialMapper materialMapper;

    private UUID testId;
    private Category testCategory;
    private MaterialType testMaterialType;
    private Unit testUnit;
    private Material testMaterial;
    private MaterialDto testMaterialDto;
    private MaterialDtoNew testMaterialDtoNew;
    private MaterialDtoUpdate testMaterialDtoUpdate;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UUID materialTypeId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();

        testCategory = new Category();
        testCategory.setId(categoryId);
        testCategory.setName("Тестовая категория");

        testMaterialType = new MaterialType();
        testMaterialType.setId(materialTypeId);
        testMaterialType.setName("Тестовый тип материала");

        testUnit = new Unit();
        testUnit.setId(unitId);
        testUnit.setName("шт");

        testMaterial = new Material();
        testMaterial.setId(testId);
        testMaterial.setName("Тестовый материал");
        testMaterial.setDescription("Описание тестового материала");
        testMaterial.setCategory(testCategory);
        testMaterial.setMaterialType(testMaterialType);
        testMaterial.setUnits(new HashSet<>(Set.of(testUnit)));
        testMaterial.setLink("https://example.com");
        testMaterial.setCode("TEST001");
        testMaterial.setCreatedAt(LocalDateTime.now());
        testMaterial.setUpdatedAt(LocalDateTime.now());

        testMaterialDto = new MaterialDto(
                testId,
                "Тестовый материал",
                "Описание тестового материала",
                new ArrayList<>(),
                new MaterialTypeDto(materialTypeId, "Тестовый тип материала"),
                "https://example.com",
                new HashSet<>(Set.of(new UnitDto(unitId, "шт", "шт"))),
                "TEST001",
                new CategoryDto(categoryId, "Тестовая категория"),
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        testMaterialDtoNew = new MaterialDtoNew(
                "Новый материал",
                "Описание нового материала",
                materialTypeId,
                "https://new.example.com",
                Set.of(unitId),
                "NEW001",
                categoryId
        );

        testMaterialDtoUpdate = new MaterialDtoUpdate(
                "Обновленный материал",
                "Обновленное описание",
                materialTypeId,
                "https://updated.example.com",
                Set.of(unitId),
                "UPD001",
                categoryId
        );
    }

    @Test
    void testToDto() {
        // Act
        MaterialDto result = materialMapper.toDto(testMaterial);

        // Assert
        assertNotNull(result);
        assertEquals(testId, result.id());
        assertEquals("Тестовый материал", result.name());
        assertEquals("Описание тестового материала", result.description());
        assertEquals("https://example.com", result.link());
        assertEquals("TEST001", result.code());
        assertNotNull(result.materialType());
        assertEquals(testMaterialType.getId(), result.materialType().id());
        assertNotNull(result.category());
        assertEquals(testCategory.getId(), result.category().id());
        assertNotNull(result.units());
        assertEquals(1, result.units().size());
    }

    @Test
    void testToEntity() {
        // Act
        Material result = materialMapper.toEntity(testMaterialDtoNew);

        // Assert
        assertNotNull(result);
        assertEquals("Новый материал", result.getName());
        assertEquals("Описание нового материала", result.getDescription());
        assertEquals("https://new.example.com", result.getLink());
        assertEquals("NEW001", result.getCode());
        // Note: Relations are not mapped in toEntity, they need to be set separately
    }

    @Test
    void testUpdateEntityFromDto() {
        // Arrange
        Material existingMaterial = new Material();
        existingMaterial.setId(testId);
        existingMaterial.setName("Старый материал");
        existingMaterial.setDescription("Старое описание");
        existingMaterial.setLink("https://old.example.com");
        existingMaterial.setCode("OLD001");

        // Act
        materialMapper.updateEntityFromDto(testMaterialDtoUpdate, existingMaterial);

        // Assert
        assertEquals("Обновленный материал", existingMaterial.getName());
        assertEquals("Обновленное описание", existingMaterial.getDescription());
        assertEquals("https://updated.example.com", existingMaterial.getLink());
        assertEquals("UPD001", existingMaterial.getCode());
        // Note: Relations are not updated in updateEntityFromDto, they need to be set separately
    }

    @Test
    void testToDtoWithNullValues() {
        // Arrange
        Material materialWithNulls = new Material();
        materialWithNulls.setId(testId);
        materialWithNulls.setName("Материал с null значениями");
        materialWithNulls.setDescription(null);
        materialWithNulls.setCategory(null);
        materialWithNulls.setMaterialType(null);
        materialWithNulls.setUnits(new HashSet<>());
        materialWithNulls.setLink(null);
        materialWithNulls.setCode(null);

        // Act
        MaterialDto result = materialMapper.toDto(materialWithNulls);

        // Assert
        assertNotNull(result);
        assertEquals(testId, result.id());
        assertEquals("Материал с null значениями", result.name());
        assertNull(result.description());
        assertNull(result.link());
        assertNull(result.code());
        assertNull(result.category());
        assertNull(result.materialType());
        assertNotNull(result.units());
        assertTrue(result.units().isEmpty());
    }

    @Test
    void testToEntityWithNullValues() {
        // Arrange
        MaterialDtoNew dtoWithNulls = new MaterialDtoNew(
                "Материал с null значениями",
                null,
                null,
                null,
                null,
                null,
                null
        );

        // Act
        Material result = materialMapper.toEntity(dtoWithNulls);

        // Assert
        assertNotNull(result);
        assertEquals("Материал с null значениями", result.getName());
        assertNull(result.getDescription());
        assertNull(result.getLink());
        assertNull(result.getCode());
    }

    @Test
    void testUpdateEntityFromDtoWithNullValues() {
        // Arrange
        Material existingMaterial = new Material();
        existingMaterial.setId(testId);
        existingMaterial.setName("Старый материал");
        existingMaterial.setDescription("Старое описание");
        existingMaterial.setLink("https://old.example.com");
        existingMaterial.setCode("OLD001");

        MaterialDtoUpdate dtoWithNulls = new MaterialDtoUpdate(
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        // Act
        materialMapper.updateEntityFromDto(dtoWithNulls, existingMaterial);

        // Assert
        // При использовании NullValuePropertyMappingStrategy.IGNORE, null значения не должны обновлять поля
        assertEquals("Старый материал", existingMaterial.getName());
        assertEquals("Старое описание", existingMaterial.getDescription());
        assertEquals("https://old.example.com", existingMaterial.getLink());
        assertEquals("OLD001", existingMaterial.getCode());
    }
} 