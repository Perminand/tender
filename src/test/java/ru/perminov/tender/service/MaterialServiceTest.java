package ru.perminov.tender.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.perminov.tender.dto.CategoryDto;
import ru.perminov.tender.dto.MaterialTypeDto;
import ru.perminov.tender.dto.UnitDto;
import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.mapper.MaterialMapper;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.repository.CategoryRepository;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.repository.MaterialTypeRepository;
import ru.perminov.tender.repository.UnitRepository;
import ru.perminov.tender.service.impl.MaterialServiceImpl;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaterialServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private MaterialTypeRepository materialTypeRepository;

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private MaterialMapper materialMapper;

    @InjectMocks
    private MaterialServiceImpl materialService;

    private Material testMaterial;
    private MaterialDto testMaterialDto;
    private Category testCategory;
    private MaterialType testMaterialType;
    private Unit testUnit;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        
        testCategory = new Category();
        testCategory.setId(UUID.randomUUID());
        testCategory.setName("Тестовая категория");

        testMaterialType = new MaterialType();
        testMaterialType.setId(UUID.randomUUID());
        testMaterialType.setName("Тестовый тип");

        testUnit = new Unit();
        testUnit.setId(UUID.randomUUID());
        testUnit.setName("шт");

        testMaterial = new Material();
        testMaterial.setId(testId);
        testMaterial.setName("Тестовый материал");
        testMaterial.setDescription("Описание тестового материала");
        testMaterial.setCategory(testCategory);
        testMaterial.setMaterialType(testMaterialType);
        testMaterial.setUnits(new HashSet<>(Arrays.asList(testUnit)));
        testMaterial.setLink("https://example.com");
        testMaterial.setCode("TEST001");
        testMaterial.setCreatedAt(LocalDateTime.now());
        testMaterial.setUpdatedAt(LocalDateTime.now());

        testMaterialDto = new MaterialDto(
                testId,
                "Тестовый материал",
                "Описание тестового материала",
                new ArrayList<>(),
                new MaterialTypeDto(testMaterialType.getId(), testMaterialType.getName()),
                "https://example.com",
                new HashSet<>(Arrays.asList(new UnitDto(testUnit.getId(), testUnit.getName(), "шт"))),
                "TEST001",
                new CategoryDto(testCategory.getId(), testCategory.getName()),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    void testCreateMaterial_Success() {
        // Arrange
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Новый материал",
                "Описание нового материала",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "NEW001",
                testCategory.getId()
        );

        when(materialRepository.existsByName("Новый материал")).thenReturn(false);
        when(materialMapper.toEntity(materialDtoNew)).thenReturn(testMaterial);
        when(categoryRepository.findById(testCategory.getId())).thenReturn(Optional.of(testCategory));
        when(materialTypeRepository.findById(testMaterialType.getId())).thenReturn(Optional.of(testMaterialType));
        when(unitRepository.findAllById(Set.of(testUnit.getId()))).thenReturn(Arrays.asList(testUnit));
        when(materialRepository.save(any(Material.class))).thenReturn(testMaterial);
        when(materialMapper.toDto(testMaterial)).thenReturn(testMaterialDto);

        // Act
        MaterialDto result = materialService.create(materialDtoNew);

        // Assert
        assertNotNull(result);
        assertEquals("Тестовый материал", result.name());
        verify(materialRepository).existsByName("Новый материал");
        verify(materialRepository).save(any(Material.class));
        verify(materialMapper).toDto(testMaterial);
    }

    @Test
    void testCreateMaterial_DuplicateName() {
        // Arrange
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Существующий материал",
                "Описание",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "DUP001",
                testCategory.getId()
        );

        when(materialRepository.existsByName("Существующий материал")).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> materialService.create(materialDtoNew));
        assertEquals("Материал с именем 'Существующий материал' уже существует", exception.getMessage());
        verify(materialRepository).existsByName("Существующий материал");
        verify(materialRepository, never()).save(any());
    }

    @Test
    void testUpdateMaterial_Success() {
        // Arrange
        MaterialDtoUpdate materialDtoUpdate = new MaterialDtoUpdate(
                "Обновленный материал",
                "Обновленное описание",
                testMaterialType.getId(),
                "https://updated.com",
                Set.of(testUnit.getId()),
                "UPD001",
                testCategory.getId()
        );

        when(materialRepository.findById(testId)).thenReturn(Optional.of(testMaterial));
        when(categoryRepository.findById(testCategory.getId())).thenReturn(Optional.of(testCategory));
        when(materialTypeRepository.findById(testMaterialType.getId())).thenReturn(Optional.of(testMaterialType));
        when(unitRepository.findAllById(Set.of(testUnit.getId()))).thenReturn(Arrays.asList(testUnit));
        when(materialRepository.save(testMaterial)).thenReturn(testMaterial);
        when(materialMapper.toDto(testMaterial)).thenReturn(testMaterialDto);

        // Act
        MaterialDto result = materialService.update(testId, materialDtoUpdate);

        // Assert
        assertNotNull(result);
        verify(materialRepository).findById(testId);
        verify(materialRepository).save(testMaterial);
        verify(materialMapper).toDto(testMaterial);
    }

    @Test
    void testUpdateMaterial_NotFound() {
        // Arrange
        MaterialDtoUpdate materialDtoUpdate = new MaterialDtoUpdate(
                "Обновленный материал",
                "Описание",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "UPD001",
                testCategory.getId()
        );

        when(materialRepository.findById(testId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> materialService.update(testId, materialDtoUpdate));
        assertEquals("Материал не найден по id: " + testId, exception.getMessage());
        verify(materialRepository).findById(testId);
        verify(materialRepository, never()).save(any());
    }

    @Test
    void testDeleteMaterial_Success() {
        // Arrange
        when(materialRepository.existsById(testId)).thenReturn(true);
        doNothing().when(materialRepository).deleteById(testId);

        // Act
        materialService.delete(testId);

        // Assert
        verify(materialRepository).existsById(testId);
        verify(materialRepository).deleteById(testId);
    }

    @Test
    void testDeleteMaterial_NotFound() {
        // Arrange
        when(materialRepository.existsById(testId)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> materialService.delete(testId));
        assertEquals("Материал не найден по id: " + testId, exception.getMessage());
        verify(materialRepository).existsById(testId);
        verify(materialRepository, never()).deleteById(any());
    }

    @Test
    void testGetById_Success() {
        // Arrange
        when(materialRepository.findById(testId)).thenReturn(Optional.of(testMaterial));
        when(materialMapper.toDto(testMaterial)).thenReturn(testMaterialDto);

        // Act
        MaterialDto result = materialService.getById(testId);

        // Assert
        assertNotNull(result);
        assertEquals(testId, result.id());
        verify(materialRepository).findById(testId);
        verify(materialMapper).toDto(testMaterial);
    }

    @Test
    void testGetById_NotFound() {
        // Arrange
        when(materialRepository.findById(testId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> materialService.getById(testId));
        assertEquals("Материал не найден по id: " + testId, exception.getMessage());
        verify(materialRepository).findById(testId);
        verify(materialMapper, never()).toDto(any());
    }

    @Test
    void testGetAll_Success() {
        // Arrange
        List<Material> materials = Arrays.asList(testMaterial);
        when(materialRepository.findAll()).thenReturn(materials);
        when(materialMapper.toDto(testMaterial)).thenReturn(testMaterialDto);

        // Act
        List<MaterialDto> result = materialService.getAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testMaterialDto, result.get(0));
        verify(materialRepository).findAll();
        verify(materialMapper).toDto(testMaterial);
    }

    @Test
    void testGetAll_EmptyList() {
        // Arrange
        when(materialRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<MaterialDto> result = materialService.getAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(materialRepository).findAll();
        verify(materialMapper, never()).toDto(any());
    }
} 