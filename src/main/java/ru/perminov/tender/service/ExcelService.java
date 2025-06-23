package ru.perminov.tender.service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.ProjectObjectDto;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.model.Unit;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelService {

    public ByteArrayInputStream exportCategoriesToExcel(List<Category> categories) {
        String[] columns = {"ID", "Name"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("Categories");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (Category category : categories) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(category.getId().toString());
                row.createCell(1).setCellValue(category.getName());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportMaterialTypesToExcel(List<MaterialType> materialTypes) {
        String[] columns = {"ID", "Name"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("MaterialTypes");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (MaterialType materialType : materialTypes) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(materialType.getId().toString());
                row.createCell(1).setCellValue(materialType.getName());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportUnitsToExcel(List<Unit> units) {
        String[] columns = {"ID", "Name", "ShortName"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("Units");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (Unit unit : units) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(unit.getId().toString());
                row.createCell(1).setCellValue(unit.getName());
                row.createCell(2).setCellValue(unit.getShortName());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportContactTypesToExcel(List<ContactTypeDto> contactTypes) {
        String[] columns = {"ID", "Name"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("ContactTypes");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (ContactTypeDto contactType : contactTypes) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(contactType.id().toString());
                row.createCell(1).setCellValue(contactType.name());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportCompaniesToExcel(List<CompanyDto> companies) {
        String[] columns = {"ID", "ИНН", "КПП", "ОГРН", "Название", "Юридическое название", "Адрес", "Тип компании", "Директор", "Телефон", "Email"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("Companies");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (CompanyDto company : companies) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(company.id().toString());
                row.createCell(1).setCellValue(company.inn() != null ? company.inn() : "");
                row.createCell(2).setCellValue(company.kpp() != null ? company.kpp() : "");
                row.createCell(3).setCellValue(company.ogrn() != null ? company.ogrn() : "");
                row.createCell(4).setCellValue(company.name() != null ? company.name() : "");
                row.createCell(5).setCellValue(company.legalName() != null ? company.legalName() : "");
                row.createCell(6).setCellValue(company.address() != null ? company.address() : "");
                row.createCell(7).setCellValue(company.typeName() != null ? company.typeName() : "");
                row.createCell(8).setCellValue(company.director() != null ? company.director() : "");
                row.createCell(9).setCellValue(company.phone() != null ? company.phone() : "");
                row.createCell(10).setCellValue(company.email() != null ? company.email() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportMaterialsToExcel(List<Material> materials) {
        String[] columns = {"ID", "Название", "Описание", "Тип материала", "Ссылка", "Код/Артикул", "Категория", "Единицы измерения", "Дата создания", "Дата обновления"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("Materials");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (Material material : materials) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(material.getId().toString());
                row.createCell(1).setCellValue(material.getName() != null ? material.getName() : "");
                row.createCell(2).setCellValue(material.getDescription() != null ? material.getDescription() : "");
                row.createCell(3).setCellValue(material.getMaterialType() != null ? material.getMaterialType().getName() : "");
                row.createCell(4).setCellValue(material.getLink() != null ? material.getLink() : "");
                row.createCell(5).setCellValue(material.getCode() != null ? material.getCode() : "");
                row.createCell(6).setCellValue(material.getCategory() != null ? material.getCategory().getName() : "");
                
                // Единицы измерения (множественные значения)
                String unitsStr = "";
                if (material.getUnits() != null && !material.getUnits().isEmpty()) {
                    unitsStr = material.getUnits().stream()
                            .map(Unit::getName)
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("");
                }
                row.createCell(7).setCellValue(unitsStr);
                
                row.createCell(8).setCellValue(material.getCreatedAt() != null ? material.getCreatedAt().toString() : "");
                row.createCell(9).setCellValue(material.getUpdatedAt() != null ? material.getUpdatedAt().toString() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportProjectObjectsToExcel(List<ProjectObjectDto> projectObjects) {
        String[] columns = {"ID", "Название", "Описание"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("ProjectObjects");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (ProjectObjectDto projectObject : projectObjects) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(projectObject.id().toString());
                row.createCell(1).setCellValue(projectObject.name() != null ? projectObject.name() : "");
                row.createCell(2).setCellValue(projectObject.description() != null ? projectObject.description() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }
} 