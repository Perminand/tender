package ru.perminov.tender.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.model.Unit;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class MaterialRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MaterialTypeRepository materialTypeRepository;

    @Autowired
    private UnitRepository unitRepository;

    private Category testCategory;
    private MaterialType testMaterialType;
    private Unit testUnit;
    private Material testMaterial;

    @BeforeEach
    void setUp() {
        // Создаем тестовые данные
        testCategory = new Category();
        testCategory.setName("Тестовая категория");
        testCategory = entityManager.persistAndFlush(testCategory);

        testMaterialType = new MaterialType();
        testMaterialType.setName("Тестовый тип материала");
        testMaterialType = entityManager.persistAndFlush(testMaterialType);

        testUnit = new Unit();
        testUnit.setName("шт");
        testUnit = entityManager.persistAndFlush(testUnit);

        testMaterial = new Material();
        testMaterial.setName("Тестовый материал");
        testMaterial.setDescription("Описание тестового материала");
        testMaterial.setCategory(testCategory);
        testMaterial.setMaterialType(testMaterialType);
        testMaterial.setUnits(new HashSet<>(Set.of(testUnit)));
        testMaterial.setLink("https://example.com");
        testMaterial.setCode("TEST001");
    }

    @Test
    void testSaveMaterial() {
        // Act
        Material savedMaterial = materialRepository.save(testMaterial);

        // Assert
        assertNotNull(savedMaterial.getId());
        assertEquals("Тестовый материал", savedMaterial.getName());
        assertEquals("Описание тестового материала", savedMaterial.getDescription());
        assertEquals(testCategory, savedMaterial.getCategory());
        assertEquals(testMaterialType, savedMaterial.getMaterialType());
        assertEquals(1, savedMaterial.getUnits().size());
        assertTrue(savedMaterial.getUnits().contains(testUnit));
    }

    @Test
    void testFindById() {
        // Arrange
        Material savedMaterial = materialRepository.save(testMaterial);

        // Act
        Optional<Material> foundMaterial = materialRepository.findById(savedMaterial.getId());

        // Assert
        assertTrue(foundMaterial.isPresent());
        assertEquals(savedMaterial.getId(), foundMaterial.get().getId());
        assertEquals("Тестовый материал", foundMaterial.get().getName());
    }

    @Test
    void testFindById_NotFound() {
        // Act
        Optional<Material> foundMaterial = materialRepository.findById(java.util.UUID.randomUUID());

        // Assert
        assertFalse(foundMaterial.isPresent());
    }

    @Test
    void testFindAll() {
        // Arrange
        Material material1 = new Material();
        material1.setName("Материал 1");
        material1.setDescription("Описание 1");
        material1.setCategory(testCategory);
        material1.setMaterialType(testMaterialType);
        material1.setUnits(new HashSet<>());
        material1.setLink("https://example1.com");
        material1.setCode("TEST001");

        Material material2 = new Material();
        material2.setName("Материал 2");
        material2.setDescription("Описание 2");
        material2.setCategory(testCategory);
        material2.setMaterialType(testMaterialType);
        material2.setUnits(new HashSet<>());
        material2.setLink("https://example2.com");
        material2.setCode("TEST002");

        materialRepository.save(material1);
        materialRepository.save(material2);

        // Act
        List<Material> materials = materialRepository.findAll();

        // Assert
        assertTrue(materials.size() >= 2);
        assertTrue(materials.stream().anyMatch(m -> m.getName().equals("Материал 1")));
        assertTrue(materials.stream().anyMatch(m -> m.getName().equals("Материал 2")));
    }

    @Test
    void testExistsByName() {
        // Arrange
        Material savedMaterial = materialRepository.save(testMaterial);

        // Act & Assert
        assertTrue(materialRepository.existsByName("Тестовый материал"));
        assertFalse(materialRepository.existsByName("Несуществующий материал"));
    }

    @Test
    void testDeleteById() {
        // Arrange
        Material savedMaterial = materialRepository.save(testMaterial);

        // Act
        materialRepository.deleteById(savedMaterial.getId());

        // Assert
        assertFalse(materialRepository.existsById(savedMaterial.getId()));
        assertFalse(materialRepository.existsByName("Тестовый материал"));
    }

    @Test
    void testUpdateMaterial() {
        // Arrange
        Material savedMaterial = materialRepository.save(testMaterial);
        savedMaterial.setName("Обновленный материал");
        savedMaterial.setDescription("Обновленное описание");

        // Act
        Material updatedMaterial = materialRepository.save(savedMaterial);

        // Assert
        assertEquals("Обновленный материал", updatedMaterial.getName());
        assertEquals("Обновленное описание", updatedMaterial.getDescription());
        
        // Проверяем, что изменения сохранились в базе
        Optional<Material> foundMaterial = materialRepository.findById(savedMaterial.getId());
        assertTrue(foundMaterial.isPresent());
        assertEquals("Обновленный материал", foundMaterial.get().getName());
    }

    @Test
    void testFindAllWithCategory() {
        // Arrange
        Material savedMaterial = materialRepository.save(testMaterial);

        // Act
        List<Material> allMaterials = materialRepository.findAll();

        // Assert
        assertFalse(allMaterials.isEmpty());
        assertTrue(allMaterials.stream()
                .anyMatch(m -> m.getCategory() != null && 
                        m.getCategory().getId().equals(testCategory.getId())));
    }

    @Test
    void testFindAllWithMaterialType() {
        // Arrange
        Material savedMaterial = materialRepository.save(testMaterial);

        // Act
        List<Material> allMaterials = materialRepository.findAll();

        // Assert
        assertFalse(allMaterials.isEmpty());
        assertTrue(allMaterials.stream()
                .anyMatch(m -> m.getMaterialType() != null && 
                        m.getMaterialType().getId().equals(testMaterialType.getId())));
    }
} 