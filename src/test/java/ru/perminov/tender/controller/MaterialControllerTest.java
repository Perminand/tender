package ru.perminov.tender.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.dto.material.MaterialDtoNew;
import ru.perminov.tender.dto.material.MaterialDtoUpdate;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.model.Unit;
import ru.perminov.tender.repository.CategoryRepository;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.repository.MaterialTypeRepository;
import ru.perminov.tender.repository.UnitRepository;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import java.io.ByteArrayOutputStream;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MaterialControllerTestFixed {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MaterialTypeRepository materialTypeRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    private Category testCategory;
    private MaterialType testMaterialType;
    private Unit testUnit;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        // Создаем тестовые данные
        testCategory = new Category();
        testCategory.setName("Тестовая категория");
        testCategory = categoryRepository.save(testCategory);

        testMaterialType = new MaterialType();
        testMaterialType.setName("Тестовый тип материала");
        testMaterialType = materialTypeRepository.save(testMaterialType);

        testUnit = new Unit();
        testUnit.setName("шт");
        testUnit = unitRepository.save(testUnit);
    }

    @Test
    void testCreateMaterial() throws Exception {
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Тестовый материал",
                "Описание тестового материала",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "TEST001",
                testCategory.getId()
        );

        mockMvc.perform(post("/api/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(materialDtoNew)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Тестовый материал"))
                .andExpect(jsonPath("$.description").value("Описание тестового материала"))
                .andExpect(jsonPath("$.code").value("TEST001"));
    }

    @Test
    void testCreateMaterialWithInvalidData() throws Exception {
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "", // пустое имя
                "Описание",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "TEST001",
                testCategory.getId()
        );

        mockMvc.perform(post("/api/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(materialDtoNew)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetAllMaterials() throws Exception {
        // Создаем тестовый материал
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Материал для списка",
                "Описание",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "TEST002",
                testCategory.getId()
        );

        mockMvc.perform(post("/api/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(materialDtoNew)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/materials"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    void testGetMaterialById() throws Exception {
        // Создаем тестовый материал
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Материал для получения",
                "Описание",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "TEST003",
                testCategory.getId()
        );

        String response = mockMvc.perform(post("/api/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(materialDtoNew)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        MaterialDto createdMaterial = objectMapper.readValue(response, MaterialDto.class);

        mockMvc.perform(get("/api/materials/" + createdMaterial.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdMaterial.id().toString()))
                .andExpect(jsonPath("$.name").value("Материал для получения"));
    }

    @Test
    void testGetMaterialByIdNotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        
        mockMvc.perform(get("/api/materials/" + nonExistentId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateMaterial() throws Exception {
        // Создаем тестовый материал
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Материал для обновления",
                "Описание",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "TEST004",
                testCategory.getId()
        );

        String response = mockMvc.perform(post("/api/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(materialDtoNew)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        MaterialDto createdMaterial = objectMapper.readValue(response, MaterialDto.class);

        MaterialDtoUpdate updateDto = new MaterialDtoUpdate(
                "Обновленный материал",
                "Обновленное описание",
                testMaterialType.getId(),
                "https://updated.com",
                Set.of(testUnit.getId()),
                "UPDATED001",
                testCategory.getId()
        );

        mockMvc.perform(put("/api/materials/" + createdMaterial.id())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Обновленный материал"))
                .andExpect(jsonPath("$.description").value("Обновленное описание"));
    }

    @Test
    void testDeleteMaterial() throws Exception {
        // Создаем тестовый материал
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Материал для удаления",
                "Описание",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "TEST005",
                testCategory.getId()
        );

        String response = mockMvc.perform(post("/api/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(materialDtoNew)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        MaterialDto createdMaterial = objectMapper.readValue(response, MaterialDto.class);

        mockMvc.perform(delete("/api/materials/" + createdMaterial.id()))
                .andExpect(status().isOk());

        // Проверяем, что материал действительно удален
        mockMvc.perform(get("/api/materials/" + createdMaterial.id()))
                .andExpect(status().isNotFound());
    }

    @Test
    void testImportFromExcel() throws Exception {
        // Создаем настоящий Excel-файл с помощью Apache POI
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Название");
        header.createCell(1).setCellValue("Описание");
        header.createCell(2).setCellValue("Тип материала");
        header.createCell(3).setCellValue("Ссылка");
        header.createCell(4).setCellValue("Код");
        header.createCell(5).setCellValue("Категория");
        header.createCell(6).setCellValue("Единицы измерения");
        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue("Импортированный материал");
        row.createCell(1).setCellValue("Описание импортированного материала");
        row.createCell(2).setCellValue("Тип материала");
        row.createCell(3).setCellValue("https://example.com");
        row.createCell(4).setCellValue("TEST006");
        row.createCell(5).setCellValue("Тестовая категория");
        row.createCell(6).setCellValue("шт");
        workbook.write(out);
        workbook.close();

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "materials.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                out.toByteArray()
        );

        mockMvc.perform(multipart("/api/materials/import")
                        .file(file))
                .andExpect(status().isOk());
    }

    @Test
    void testExportMaterials() throws Exception {
        // Создаем тестовый материал для экспорта
        MaterialDtoNew materialDtoNew = new MaterialDtoNew(
                "Материал для экспорта",
                "Описание",
                testMaterialType.getId(),
                "https://example.com",
                Set.of(testUnit.getId()),
                "TEST007",
                testCategory.getId()
        );

        mockMvc.perform(post("/api/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(materialDtoNew)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/materials/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=materials.xlsx"))
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }
} 