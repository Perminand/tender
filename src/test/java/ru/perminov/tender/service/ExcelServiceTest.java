package ru.perminov.tender.service;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import ru.perminov.tender.dto.material.MaterialDto;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ExcelServiceTest {

    @InjectMocks
    private ExcelService excelService;

    private List<MaterialDto> testMaterials;

    @BeforeEach
    void setUp() {
        testMaterials = new ArrayList<>();
        
        MaterialDto material1 = new MaterialDto(
                UUID.randomUUID(),
                "Тестовый материал 1",
                "Описание материала 1",
                new ArrayList<>(),
                null,
                "https://example1.com",
                new HashSet<>(),
                "TEST001",
                null,
                null,
                null
        );

        MaterialDto material2 = new MaterialDto(
                UUID.randomUUID(),
                "Тестовый материал 2",
                "Описание материала 2",
                new ArrayList<>(),
                null,
                "https://example2.com",
                new HashSet<>(),
                "TEST002",
                null,
                null,
                null
        );

        testMaterials.add(material1);
        testMaterials.add(material2);
    }

    @Test
    void testExportMaterialsToExcel() throws IOException {
        // Act
        InputStream result = excelService.exportMaterialsToExcel(testMaterials);

        // Assert
        assertNotNull(result);
        
        // Проверяем, что это валидный Excel файл
        try (Workbook workbook = new XSSFWorkbook(result)) {
            Sheet sheet = workbook.getSheetAt(0);
            assertNotNull(sheet);
            
            // Проверяем заголовки
            assertEquals("ID", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("Название", sheet.getRow(0).getCell(1).getStringCellValue());
            assertEquals("Описание", sheet.getRow(0).getCell(2).getStringCellValue());
            assertEquals("Тип материала", sheet.getRow(0).getCell(3).getStringCellValue());
            assertEquals("Ссылка", sheet.getRow(0).getCell(4).getStringCellValue());
            assertEquals("Код", sheet.getRow(0).getCell(5).getStringCellValue());
            assertEquals("Категория", sheet.getRow(0).getCell(6).getStringCellValue());
            assertEquals("Единицы измерения", sheet.getRow(0).getCell(7).getStringCellValue());
            
            // Проверяем данные
            assertEquals("Тестовый материал 1", sheet.getRow(1).getCell(1).getStringCellValue());
            assertEquals("Описание материала 1", sheet.getRow(1).getCell(2).getStringCellValue());
            assertEquals("https://example1.com", sheet.getRow(1).getCell(4).getStringCellValue());
            assertEquals("TEST001", sheet.getRow(1).getCell(5).getStringCellValue());
            
            assertEquals("Тестовый материал 2", sheet.getRow(2).getCell(1).getStringCellValue());
            assertEquals("Описание материала 2", sheet.getRow(2).getCell(2).getStringCellValue());
            assertEquals("https://example2.com", sheet.getRow(2).getCell(4).getStringCellValue());
            assertEquals("TEST002", sheet.getRow(2).getCell(5).getStringCellValue());
        }
    }

    @Test
    void testExportMaterialsToExcelEmptyList() throws IOException {
        // Act
        InputStream result = excelService.exportMaterialsToExcel(new ArrayList<>());

        // Assert
        assertNotNull(result);
        
        try (Workbook workbook = new XSSFWorkbook(result)) {
            Sheet sheet = workbook.getSheetAt(0);
            assertNotNull(sheet);
            
            // Проверяем, что есть только заголовки
            assertEquals("ID", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("Название", sheet.getRow(0).getCell(1).getStringCellValue());
            
            // Проверяем, что нет данных
            assertNull(sheet.getRow(1));
        }
    }

    @Test
    void testExportMaterialsToExcelNullList() throws IOException {
        // Act
        InputStream result = excelService.exportMaterialsToExcel(null);

        // Assert
        assertNotNull(result);
        
        try (Workbook workbook = new XSSFWorkbook(result)) {
            Sheet sheet = workbook.getSheetAt(0);
            assertNotNull(sheet);
            
            // Проверяем, что есть только заголовки
            assertEquals("ID", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("Название", sheet.getRow(0).getCell(1).getStringCellValue());
            
            // Проверяем, что нет данных
            assertNull(sheet.getRow(1));
        }
    }

    @Test
    void testCreateExcelFile() throws IOException {
        // Act
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Тест");
            
            // Создаем заголовки
            var headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Колонка 1");
            headerRow.createCell(1).setCellValue("Колонка 2");
            
            // Создаем данные
            var dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("Значение 1");
            dataRow.createCell(1).setCellValue("Значение 2");
            
            workbook.write(outputStream);
        }

        // Assert
        byte[] bytes = outputStream.toByteArray();
        assertNotNull(bytes);
        assertTrue(bytes.length > 0);
        
        // Проверяем, что файл можно прочитать
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);
             Workbook workbook = new XSSFWorkbook(inputStream)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals("Тест", sheet.getSheetName());
            assertEquals("Колонка 1", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("Колонка 2", sheet.getRow(0).getCell(1).getStringCellValue());
            assertEquals("Значение 1", sheet.getRow(1).getCell(0).getStringCellValue());
            assertEquals("Значение 2", sheet.getRow(1).getCell(1).getStringCellValue());
        }
    }

    @Test
    void testReadExcelFile() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Материалы");
            
            // Создаем заголовки
            var headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("ID");
            headerRow.createCell(1).setCellValue("Название");
            headerRow.createCell(2).setCellValue("Описание");
            
            // Создаем данные
            var dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("1");
            dataRow.createCell(1).setCellValue("Тестовый материал");
            dataRow.createCell(2).setCellValue("Описание материала");
            
            workbook.write(outputStream);
        }

        byte[] bytes = outputStream.toByteArray();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                bytes
        );

        // Act & Assert
        assertNotNull(file.getInputStream());
        assertTrue(file.getSize() > 0);
        assertEquals("test.xlsx", file.getOriginalFilename());
        assertEquals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", file.getContentType());
    }
} 