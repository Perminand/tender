package ru.perminov.tender.service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.company.CompanyExportDto;
import ru.perminov.tender.dto.company.BankAccountDto;
import ru.perminov.tender.dto.company.contact.ContactTypeDto;
import ru.perminov.tender.dto.company.contact.ContactPersonDto;
import ru.perminov.tender.dto.company.contact.ContactDto;
import ru.perminov.tender.dto.material.MaterialExportDto;
import ru.perminov.tender.model.Category;
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

    public ByteArrayInputStream exportCompaniesToExcel(List<CompanyExportDto> companies) {
        String[] columns = {
            "ID", "ИНН", "КПП", "ОГРН", "Название", "Юридическое название", 
            "Адрес", "Тип компании", "Руководитель", "Телефон", "Email",
            "Банковские реквизиты", "Контактные лица"
        };
        
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("Контрагенты");

            // Создаем заголовки
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (CompanyExportDto company : companies) {
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
                
                // Банковские реквизиты
                StringBuilder bankDetails = new StringBuilder();
                if (company.bankDetails() != null) {
                    for (BankAccountDto bank : company.bankDetails()) {
                        if (bankDetails.length() > 0) bankDetails.append("; ");
                        bankDetails.append(bank.getBankName())
                                 .append(" (БИК: ").append(bank.getBik()).append(")");
                    }
                }
                row.createCell(11).setCellValue(bankDetails.toString());
                
                // Контактные лица
                StringBuilder contactPersons = new StringBuilder();
                if (company.contactPersons() != null) {
                    for (ContactPersonDto person : company.contactPersons()) {
                        if (contactPersons.length() > 0) contactPersons.append("; ");
                        contactPersons.append(person.lastName())
                                    .append(" ").append(person.firstName())
                                    .append(" (").append(person.position()).append(")");
                        
                        // Добавляем контакты
                        if (person.contacts() != null && !person.contacts().isEmpty()) {
                            contactPersons.append(" - ");
                            for (ContactDto contact : person.contacts()) {
                                contactPersons.append(contact.contactType().name())
                                            .append(": ").append(contact.value()).append(", ");
                            }
                            contactPersons.setLength(contactPersons.length() - 2); // убираем последнюю запятую
                        }
                    }
                }
                row.createCell(12).setCellValue(contactPersons.toString());
            }

            // Автоматически подгоняем ширину столбцов
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to export companies to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportMaterialsToExcel(List<MaterialExportDto> materials) {
        String[] columns = {
            "ID", "Название", "Описание", "Тип материала", "Ссылка", 
            "Код/Артикул", "Категория", "Единицы измерения", "Дата создания", "Дата обновления"
        };
        
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            Sheet sheet = workbook.createSheet("Номенклатура");

            // Создаем заголовки
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
            }

            int rowIdx = 1;
            for (MaterialExportDto material : materials) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(material.id().toString());
                row.createCell(1).setCellValue(material.name() != null ? material.name() : "");
                row.createCell(2).setCellValue(material.description() != null ? material.description() : "");
                row.createCell(3).setCellValue(material.materialTypeName() != null ? material.materialTypeName() : "");
                row.createCell(4).setCellValue(material.link() != null ? material.link() : "");
                row.createCell(5).setCellValue(material.code() != null ? material.code() : "");
                row.createCell(6).setCellValue(material.categoryName() != null ? material.categoryName() : "");
                
                // Единицы измерения
                String units = "";
                if (material.unitNames() != null && !material.unitNames().isEmpty()) {
                    units = String.join(", ", material.unitNames());
                }
                row.createCell(7).setCellValue(units);
                
                // Даты
                row.createCell(8).setCellValue(material.createdAt() != null ? material.createdAt().toString() : "");
                row.createCell(9).setCellValue(material.updatedAt() != null ? material.updatedAt().toString() : "");
            }

            // Автоматически подгоняем ширину столбцов
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to export materials to Excel file: " + e.getMessage());
        }
    }
} 