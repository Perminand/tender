package ru.perminov.tender.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.RequestProcessDto;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.ProposalItemDto;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.model.company.ContactPerson;
import ru.perminov.tender.model.company.Contact;
import ru.perminov.tender.model.company.ContactType;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.repository.company.ContactPersonRepository;
import ru.perminov.tender.repository.company.ContactTypeRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelReportService {

    private final CompanyRepository companyRepository;
    private final ContactPersonRepository contactPersonRepository;
    private final ContactTypeRepository contactTypeRepository;

    public byte[] generateTenderReport(RequestProcessDto requestProcess) {
        log.info("Генерация Excel-отчета для заявки: {}", requestProcess.getRequestNumber());
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Тендерная таблица");
            
            // Создаем стили
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle supplierHeaderStyle = createSupplierHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle totalStyle = createTotalStyle(workbook);
            CellStyle highlightedStyle = createHighlightedStyle(workbook);
            
            // Заголовок отчета
            createReportHeader(sheet, requestProcess, headerStyle);
            
            // Информация о поставщиках
            List<SupplierInfo> suppliers = collectSupplierInfo(requestProcess);
            createSupplierInfoSection(sheet, suppliers, supplierHeaderStyle, dataStyle);
            
            // Основная таблица с материалами
            int currentRow = createMaterialsTable(sheet, requestProcess, suppliers, 
                headerStyle, dataStyle, totalStyle, highlightedStyle);
            
            // Автоматическая настройка ширины столбцов
            autoSizeColumns(sheet);
            
            // Сохраняем в байтовый массив
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            log.info("Excel-отчет успешно сгенерирован для заявки: {}", requestProcess.getRequestNumber());
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("Ошибка при генерации Excel-отчета для заявки {}: {}", 
                requestProcess.getRequestNumber(), e.getMessage(), e);
            throw new RuntimeException("Ошибка при генерации отчета", e);
        }
    }
    
    private void createReportHeader(Sheet sheet, RequestProcessDto requestProcess, CellStyle headerStyle) {
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Тендерная таблица по заявке " + requestProcess.getProject());
        titleCell.setCellStyle(headerStyle);
        
        // Объединяем ячейки для заголовка
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 19));
    }
    
    private List<SupplierInfo> collectSupplierInfo(RequestProcessDto requestProcess) {
        List<SupplierInfo> suppliers = new ArrayList<>();
        
        if (requestProcess.getTenders() != null) {
            for (RequestProcessDto.TenderProcessDto tender : requestProcess.getTenders()) {
                if (tender.getProposals() != null) {
                    for (RequestProcessDto.SupplierProposalDto proposal : tender.getProposals()) {
                        // Проверяем, не добавлен ли уже этот поставщик
                        boolean alreadyExists = suppliers.stream()
                            .anyMatch(s -> s.supplierId.equals(proposal.getSupplierId()));
                        
                        if (!alreadyExists) {
                            SupplierInfo supplierInfo = new SupplierInfo();
                            supplierInfo.supplierId = proposal.getSupplierId();
                            supplierInfo.supplierName = proposal.getSupplierName();
                            
                            // Получаем дополнительную информацию о поставщике
                            try {
                                Company company = companyRepository.findById(proposal.getSupplierId()).orElse(null);
                                if (company != null) {
                                    supplierInfo.phone = company.getPhone();
                                    supplierInfo.email = company.getEmail();
                                    
                                    // Получаем контактное лицо
                                    List<ContactPerson> contactPersons = contactPersonRepository.findByCompanyId(proposal.getSupplierId());
                                    if (!contactPersons.isEmpty()) {
                                        ContactPerson contactPerson = contactPersons.get(0);
                                        supplierInfo.contactName = contactPerson.getFirstName() + " " + contactPerson.getLastName();
                                        
                                        // Получаем телефон контактного лица
                                        List<Contact> contacts = contactPerson.getContacts();
                                        ContactType phoneType = contactTypeRepository.findByName("Телефон").orElse(null);
                                        if (phoneType != null) {
                                            Optional<Contact> phoneContact = contacts.stream()
                                                .filter(c -> c.getContactType().getId().equals(phoneType.getId()))
                                                .findFirst();
                                            if (phoneContact.isPresent()) {
                                                supplierInfo.contactPhone = phoneContact.get().getValue();
                                            }
                                        }
                                    }
                                }
                            } catch (Exception e) {
                                log.warn("Не удалось получить дополнительную информацию о поставщике {}: {}", 
                                    proposal.getSupplierId(), e.getMessage());
                            }
                            
                            suppliers.add(supplierInfo);
                        }
                    }
                }
            }
        }
        
        return suppliers;
    }
    
    private void createSupplierInfoSection(Sheet sheet, List<SupplierInfo> suppliers, 
                                         CellStyle headerStyle, CellStyle dataStyle) {
        String[] labels = {"Поставщик:", "Комментарий:", "Контакт:", "Телефон:", "Сайт:"};
        
        for (int i = 0; i < labels.length; i++) {
            Row row = sheet.createRow(i + 2);
            Cell labelCell = row.createCell(0);
            labelCell.setCellValue(labels[i]);
            labelCell.setCellStyle(headerStyle);
            
            // Заполняем данные поставщиков
            for (int j = 0; j < suppliers.size(); j++) {
                SupplierInfo supplier = suppliers.get(j);
                Cell dataCell = row.createCell(j * 2 + 1);
                dataCell.setCellStyle(dataStyle);
                
                switch (i) {
                    case 0: // Поставщик
                        dataCell.setCellValue(supplier.supplierName);
                        sheet.addMergedRegion(new CellRangeAddress(i + 2, i + 2, j * 2 + 1, j * 2 + 2));
                        break;
                    case 1: // Комментарий
                        dataCell.setCellValue(""); // Пока оставляем пустым
                        sheet.addMergedRegion(new CellRangeAddress(i + 2, i + 2, j * 2 + 1, j * 2 + 2));
                        break;
                    case 2: // Контакт
                        dataCell.setCellValue(supplier.contactName != null ? supplier.contactName : "");
                        sheet.addMergedRegion(new CellRangeAddress(i + 2, i + 2, j * 2 + 1, j * 2 + 2));
                        break;
                    case 3: // Телефон
                        String phone = supplier.contactPhone != null ? supplier.contactPhone : supplier.phone;
                        dataCell.setCellValue(phone != null ? phone : "");
                        sheet.addMergedRegion(new CellRangeAddress(i + 2, i + 2, j * 2 + 1, j * 2 + 2));
                        break;
                    case 4: // Сайт
                        dataCell.setCellValue(""); // Пока оставляем пустым
                        sheet.addMergedRegion(new CellRangeAddress(i + 2, i + 2, j * 2 + 1, j * 2 + 2));
                        break;
                }
            }
        }
    }
    
    private int createMaterialsTable(Sheet sheet, RequestProcessDto requestProcess, 
                                   List<SupplierInfo> suppliers, CellStyle headerStyle, 
                                   CellStyle dataStyle, CellStyle totalStyle, CellStyle highlightedStyle) {
        int currentRow = 8; // Начинаем после информации о поставщиках
        
        // Заголовки таблицы
        Row headerRow = sheet.createRow(currentRow++);
        String[] headers = {"п/н", "Наименование по Заявке", "Кол-во", "Ед.изм."};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Добавляем заголовки для поставщиков
        for (int i = 0; i < suppliers.size(); i++) {
            Cell termCell = headerRow.createCell(headers.length + i * 2);
            termCell.setCellValue("Срок (дней)");
            termCell.setCellStyle(headerStyle);
            
            Cell priceCell = headerRow.createCell(headers.length + i * 2 + 1);
            priceCell.setCellValue("Стоимость с НДС (руб.)");
            priceCell.setCellStyle(headerStyle);
        }
        
        // Группируем материалы по категориям
        Map<String, List<MaterialInfo>> materialsByCategory = groupMaterialsByCategory(requestProcess, suppliers);
        
        for (Map.Entry<String, List<MaterialInfo>> entry : materialsByCategory.entrySet()) {
            String category = entry.getKey();
            List<MaterialInfo> materials = entry.getValue();
            
            // Заголовок категории
            Row categoryRow = sheet.createRow(currentRow++);
            Cell categoryCell = categoryRow.createCell(1);
            categoryCell.setCellValue(category);
            categoryCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new CellRangeAddress(currentRow - 1, currentRow - 1, 1, 3));
            
            // Материалы в категории
            for (int i = 0; i < materials.size(); i++) {
                MaterialInfo material = materials.get(i);
                Row materialRow = sheet.createRow(currentRow++);
                
                // п/н
                Cell numCell = materialRow.createCell(0);
                numCell.setCellValue(i + 1);
                numCell.setCellStyle(dataStyle);
                
                // Наименование
                Cell nameCell = materialRow.createCell(1);
                nameCell.setCellValue(material.description);
                nameCell.setCellStyle(dataStyle);
                
                // Количество
                Cell qtyCell = materialRow.createCell(2);
                qtyCell.setCellValue(material.quantity);
                qtyCell.setCellStyle(dataStyle);
                
                // Единица измерения
                Cell unitCell = materialRow.createCell(3);
                unitCell.setCellValue(material.unitName);
                unitCell.setCellStyle(dataStyle);
                
                // Данные поставщиков
                for (int j = 0; j < suppliers.size(); j++) {
                    SupplierInfo supplier = suppliers.get(j);
                    MaterialPriceInfo priceInfo = material.prices.get(supplier.supplierId);
                    
                    // Срок
                    Cell termCell = materialRow.createCell(4 + j * 2);
                    if (priceInfo != null) {
                        termCell.setCellValue(priceInfo.deliveryDays);
                    }
                    termCell.setCellStyle(dataStyle);
                    
                    // Цена
                    Cell priceCell = materialRow.createCell(4 + j * 2 + 1);
                    if (priceInfo != null) {
                        priceCell.setCellValue(priceInfo.totalPrice.doubleValue());
                    }
                    priceCell.setCellStyle(dataStyle);
                }
            }
        }
        
        // Строка итогов
        Row totalRow = sheet.createRow(currentRow++);
        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("Итого:");
        totalLabelCell.setCellStyle(totalStyle);
        
        // Рассчитываем итоги для каждого поставщика
        for (int i = 0; i < suppliers.size(); i++) {
            SupplierInfo supplier = suppliers.get(i);
            BigDecimal totalAmount = calculateTotalForSupplier(supplier.supplierId, materialsByCategory);
            
            Cell totalCell = totalRow.createCell(4 + i * 2 + 1);
            totalCell.setCellValue(totalAmount.doubleValue());
            totalCell.setCellStyle(totalStyle);
        }
        
        return currentRow;
    }
    
    private Map<String, List<MaterialInfo>> groupMaterialsByCategory(RequestProcessDto requestProcess, 
                                                                   List<SupplierInfo> suppliers) {
        Map<String, List<MaterialInfo>> materialsByCategory = new LinkedHashMap<>();
        
        if (requestProcess.getTenders() != null) {
            for (RequestProcessDto.TenderProcessDto tender : requestProcess.getTenders()) {
                if (tender.getProposals() != null) {
                    for (RequestProcessDto.SupplierProposalDto proposal : tender.getProposals()) {
                        if (proposal.getProposalItems() != null) {
                            for (RequestProcessDto.ProposalItemDto item : proposal.getProposalItems()) {
                                // Определяем категорию материала (можно улучшить логику)
                                String category = determineMaterialCategory(item.getDescription());
                                
                                materialsByCategory.computeIfAbsent(category, k -> new ArrayList<>());
                                
                                // Проверяем, есть ли уже такой материал в категории
                                MaterialInfo existingMaterial = materialsByCategory.get(category).stream()
                                    .filter(m -> m.description.equals(item.getDescription()))
                                    .findFirst()
                                    .orElse(null);
                                
                                if (existingMaterial == null) {
                                    MaterialInfo material = new MaterialInfo();
                                    material.description = item.getDescription();
                                    material.quantity = item.getQuantity();
                                    material.unitName = item.getUnitName();
                                    material.prices = new HashMap<>();
                                    materialsByCategory.get(category).add(material);
                                    existingMaterial = material;
                                }
                                
                                                                 // Добавляем цену от поставщика
                                 MaterialPriceInfo priceInfo = new MaterialPriceInfo();
                                 priceInfo.totalPrice = item.getTotalPrice();
                                 priceInfo.deliveryDays = extractDeliveryDays(item.getDeliveryPeriod());
                                 existingMaterial.prices.put(proposal.getSupplierId(), priceInfo);
                            }
                        }
                    }
                }
            }
        }
        
        return materialsByCategory;
    }
    
    private String determineMaterialCategory(String description) {
        String desc = description.toLowerCase();
        if (desc.contains("доска") || desc.contains("брус")) {
            return "Тендер Доска";
        } else if (desc.contains("брусок") && desc.contains("термо")) {
            return "Тендер Брусок Термо";
        } else if (desc.contains("имитация") && desc.contains("бруса")) {
            return "Тендер Имитация бруса";
        } else if (desc.contains("утеплитель") || desc.contains("антисептик") || 
                   desc.contains("пленка") || desc.contains("лента") || 
                   desc.contains("шуруп") || desc.contains("дюбель")) {
            return "Тендер Материалы для фасада";
        } else {
            return "Тендер Прочие материалы";
        }
    }
    
    private Integer extractDeliveryDays(String deliveryPeriod) {
        if (deliveryPeriod == null || deliveryPeriod.trim().isEmpty()) {
            return 0;
        }
        
        // Простая логика извлечения дней из строки
        String period = deliveryPeriod.toLowerCase();
        if (period.contains("день") || period.contains("дн")) {
            // Ищем числа в строке
            String[] words = period.split("\\s+");
            for (String word : words) {
                try {
                    return Integer.parseInt(word.replaceAll("[^0-9]", ""));
                } catch (NumberFormatException e) {
                    // Продолжаем поиск
                }
            }
        }
        
        return 0;
    }
    
    private BigDecimal calculateTotalForSupplier(UUID supplierId, Map<String, List<MaterialInfo>> materialsByCategory) {
        BigDecimal total = BigDecimal.ZERO;
        
        for (List<MaterialInfo> materials : materialsByCategory.values()) {
            for (MaterialInfo material : materials) {
                MaterialPriceInfo priceInfo = material.prices.get(supplierId);
                if (priceInfo != null) {
                    total = total.add(priceInfo.totalPrice);
                }
            }
        }
        
        return total;
    }
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createSupplierHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createHighlightedStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private void autoSizeColumns(Sheet sheet) {
        for (int i = 0; i < 50; i++) { // Максимум 50 столбцов
            try {
                sheet.autoSizeColumn(i);
            } catch (Exception e) {
                break;
            }
        }
    }
    
    // Вспомогательные классы
    private static class SupplierInfo {
        UUID supplierId;
        String supplierName;
        String phone;
        String email;
        String contactName;
        String contactPhone;
    }
    
    private static class MaterialInfo {
        String description;
        Double quantity;
        String unitName;
        Map<UUID, MaterialPriceInfo> prices = new HashMap<>();
    }
    
    private static class MaterialPriceInfo {
        BigDecimal totalPrice;
        Integer deliveryDays;
    }
}
