package ru.perminov.tender.service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.company.CompanyDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.dto.material.MaterialDto;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.model.MaterialType;
import ru.perminov.tender.model.Unit;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.repository.WarehouseRepository;
import ru.perminov.tender.model.Warehouse;
import org.springframework.beans.factory.annotation.Autowired;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.io.ByteArrayInputStream;
import java.util.List;

@Service
public class ExcelService {

    @Autowired
    private WarehouseRepository warehouseRepository;

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

    public ByteArrayInputStream exportMaterialsToExcel(List<MaterialDto> materials) {
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
            for (MaterialDto material : materials) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(material.id().toString());
                row.createCell(1).setCellValue(material.name() != null ? material.name() : "");
                row.createCell(2).setCellValue(material.description() != null ? material.description() : "");
                row.createCell(3).setCellValue(material.materialType() != null ? material.materialType().name() : "");
                row.createCell(4).setCellValue(material.link() != null ? material.link() : "");
                row.createCell(5).setCellValue(material.code() != null ? material.code() : "");
                row.createCell(6).setCellValue(material.category() != null ? material.category().name() : "");

                // Единицы измерения (только имена через запятую)
                String unitsStr = "";
                if (material.units() != null && !material.units().isEmpty()) {
                    unitsStr = material.units().stream()
                            .map(unit -> unit.name())
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("");
                }
                row.createCell(7).setCellValue(unitsStr);

                row.createCell(8).setCellValue(material.createdAt() != null ? material.createdAt().toString() : "");
                row.createCell(9).setCellValue(material.updatedAt() != null ? material.updatedAt().toString() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportProjectsToExcel(List<ru.perminov.tender.dto.project.ProjectDto> projects) {
        String[] columns = {"ID", "Название", "Описание"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("Projects");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (ru.perminov.tender.dto.project.ProjectDto project : projects) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(project.id().toString());
                row.createCell(1).setCellValue(project.name() != null ? project.name() : "");
                row.createCell(2).setCellValue(project.description() != null ? project.description() : "");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }

    public byte[] exportWarehouses() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Warehouses");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Название");
            int rowIdx = 1;
            for (Warehouse warehouse : warehouseRepository.findAll()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(warehouse.getName());
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Ошибка экспорта складов", e);
        }
    }

    public void importWarehouses(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            if (rows.hasNext()) rows.next(); // skip header
            while (rows.hasNext()) {
                Row row = rows.next();
                String name = row.getCell(1).getStringCellValue();
                if (name != null && !name.trim().isEmpty()) {
                    Warehouse warehouse = new Warehouse();
                    warehouse.setName(name.trim());
                    warehouseRepository.save(warehouse);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Ошибка импорта складов", e);
        }
    }

    public ByteArrayInputStream exportWarehousesToExcel(List<Warehouse> warehouses) {
        String[] columns = {"ID", "Название"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("Warehouses");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (Warehouse warehouse : warehouses) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(warehouse.getId().toString());
                row.createCell(1).setCellValue(warehouse.getName());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Ошибка экспорта складов", e);
        }
    }
} 