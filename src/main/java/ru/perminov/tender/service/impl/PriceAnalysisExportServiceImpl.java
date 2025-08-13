package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// removed unused dto imports
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.TenderItem;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.model.ProposalItem;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.repository.TenderItemRepository;
import ru.perminov.tender.repository.SupplierProposalRepository;
import ru.perminov.tender.repository.ProposalItemRepository;
import ru.perminov.tender.service.PriceAnalysisExportService;

import java.io.ByteArrayOutputStream;
// removed unused DateTimeFormatter
import java.util.*;
// removed unused streams

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceAnalysisExportServiceImpl implements PriceAnalysisExportService {

    private final TenderRepository tenderRepository;
    private final TenderItemRepository tenderItemRepository;
    private final SupplierProposalRepository supplierProposalRepository;
    private final ProposalItemRepository proposalItemRepository;

    @Override
    @Transactional(readOnly = true)
    public ByteArrayOutputStream exportPriceAnalysisToExcel(UUID tenderId) {
        log.info("Начинаем экспорт анализа цен в Excel для тендера: {}", tenderId);
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Анализ цен");
            
            // Получаем данные тендера с заказчиком
            Tender tender = tenderRepository.findByIdWithCustomer(tenderId)
                    .orElseThrow(() -> new RuntimeException("Тендер не найден с ID: " + tenderId));
            
            log.info("Найден тендер: {} - {}", 
                tender.getTenderNumber() != null ? tender.getTenderNumber() : "Без номера",
                tender.getTitle() != null ? tender.getTitle() : "Без названия");
            
            List<TenderItem> tenderItems = tenderItemRepository.findByTenderIdWithUnit(tenderId);
            List<SupplierProposal> proposals = supplierProposalRepository.findByTenderIdWithSupplier(tenderId);
            
            log.info("Найдено позиций тендера: {}, предложений: {}", tenderItems.size(), proposals.size());
            
            if (tenderItems.isEmpty()) {
                throw new RuntimeException("У тендера нет позиций для экспорта");
            }
            
            // Создаем стили для форматирования
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle supplierHeaderStyle = createSupplierHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle priceStyle = createPriceStyle(workbook);
            CellStyle linkStyle = createHyperlinkStyle(workbook);
            
            // Базовые колонки слева по примеру
            final String[] baseHeaders = new String[] {
                "№ п/п",
                "Наименование материала, услуги по Заявке",
                "Кол-во",
                "Ед. изм.",
                "Сметное наименование",
                "Сметная цена",
                "Сметная Стоимость",
                "Лучшая цена",
                "Поставщик (лучший)",
                "Экономия",
                "Ссылка на Материал"
            };

            int baseCols = baseHeaders.length;

            // Создаем заголовок отчета (первая строка) с мерджем на всю ширину
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            String requestNumber = tender.getRequest() != null ? tender.getRequest().getRequestNumber() : null;
            String requestDate = (tender.getRequest() != null && tender.getRequest().getDate() != null) ? tender.getRequest().getDate().toString() : "";
            titleCell.setCellValue("Тендер по заявке № " + (requestNumber != null ? requestNumber : "-") + "  от  " + requestDate);
            titleCell.setCellStyle(titleStyle);
            // merge 0.. last column
            int lastCol = baseCols + 1 + (proposals.size() * 2) - 1; // +1 за столбец "№ Тендера"
            if (lastCol < 0) lastCol = baseCols - 1;
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, Math.max(lastCol, 0)));

            Row infoRow1 = sheet.createRow(1);
            infoRow1.createCell(0).setCellValue("Заказчик:");
            infoRow1.createCell(1).setCellValue(tender.getCustomer() != null ? tender.getCustomer().getName() : "");

            Row infoRow2 = sheet.createRow(2);
            infoRow2.createCell(0).setCellValue("Исполнитель:");
            
            infoRow2.createCell(3).setCellValue("Проект:"); // Cолонка D (index 3)
            infoRow2.createCell(4).setCellValue(tender.getTitle() != null ? tender.getTitle() : "");
            
            Row commentsRow = sheet.createRow(3);
            int labelCol = Math.max(0, baseCols - 1);
            commentsRow.createCell(labelCol).setCellValue("Комментарий:");
            commentsRow.createCell(3).setCellValue("Склад:");
            commentsRow.createCell(4).setCellValue(tender.getWarehouse() != null ? tender.getWarehouse().getName() : "");

            int commentsStartCol = baseCols + 1; // после столбца "№ Тендера"
            for (int i = 0; i < proposals.size(); i++) {
                String comment = Optional.ofNullable(proposals.get(i).getCommercialTerms())
                        .filter(s -> !s.isBlank())
                        .orElse(Optional.ofNullable(proposals.get(i).getCoverLetter()).orElse(""));
                int cFrom = commentsStartCol + i * 2;
                int cTo = cFrom + 1;
                Cell c = commentsRow.createCell(cFrom);
                c.setCellValue(comment);
                c.setCellStyle(dataStyle);
                commentsRow.createCell(cTo).setCellStyle(dataStyle);
                sheet.addMergedRegion(new CellRangeAddress(3, 3, cFrom, cTo));
            }

            // Пятая строка: названия поставщиков над парами колонок
            Row suppliersGroupRow = sheet.createRow(4);
            int startSupplierCol = baseCols;
            // Первый столбец после базовых — № Тендера (не мерджим)
            Cell tenderNumTop = suppliersGroupRow.createCell(startSupplierCol);
            tenderNumTop.setCellValue("");
            // Лейбл слева от блока поставщиков
            Cell supplierLabelCell = suppliersGroupRow.createCell(labelCol);
            supplierLabelCell.setCellValue("Поставщик:");
            // Далее по 2 колонки на поставщика: Срок + Стоимость
            for (int i = 0; i < proposals.size(); i++) {
                String supplierName = proposals.get(i).getSupplier() != null ? proposals.get(i).getSupplier().getName() : "";
                int fromCol = startSupplierCol + 1 + i * 2;
                int toCol = fromCol + 1;
                Cell cell = suppliersGroupRow.createCell(fromCol);
                cell.setCellValue(supplierName);
                cell.setCellStyle(supplierHeaderStyle);
                // вторая ячейка группы для корреткного merge
                Cell filler = suppliersGroupRow.createCell(toCol);
                filler.setCellStyle(supplierHeaderStyle);
                sheet.addMergedRegion(new CellRangeAddress(4, 4, fromCol, toCol));
            }
            
            // Шестая строка: заголовки таблицы (левая часть + подзаголовки для групп поставщиков)
            Row columnHeaderRow = sheet.createRow(5);
            for (int i = 0; i < baseHeaders.length; i++) {
                Cell cell = columnHeaderRow.createCell(i);
                cell.setCellValue(baseHeaders[i]);
                cell.setCellStyle(headerStyle);
            }
            // Добавляем общий столбец "№ Тендера"
            int colIndex = startSupplierCol;
            Cell tenderNumHeader = columnHeaderRow.createCell(colIndex++);
            tenderNumHeader.setCellValue("№ Тендера");
            tenderNumHeader.setCellStyle(headerStyle);

            // Для каждого поставщика: Срок + Стоимость с НДС
            for (int i = 0; i < proposals.size(); i++) {
                Cell deliveryHeader = columnHeaderRow.createCell(colIndex++);
                deliveryHeader.setCellValue("Срок (дней)");
                deliveryHeader.setCellStyle(headerStyle);

                Cell priceHeader = columnHeaderRow.createCell(colIndex++);
                priceHeader.setCellValue("Стоимость с НДС (руб.)");
                priceHeader.setCellStyle(headerStyle);
            }
            
            // Заполняем данные позиций (начиная с 7-й строки)
            int rowIndex = 6;
            for (TenderItem item : tenderItems) {
                Row dataRow = sheet.createRow(rowIndex++);
                
                // Основные данные с применением стилей
                Cell numberCell = dataRow.createCell(0);
                numberCell.setCellValue(item.getItemNumber() != null ? item.getItemNumber() : 0);
                numberCell.setCellStyle(dataStyle);
                
                Cell descCell = dataRow.createCell(1);
                String requestNameValue = "";
                if (item.getRequestMaterial() != null) {
                    var rm = item.getRequestMaterial();
                    if (rm.getSupplierMaterialName() != null && !rm.getSupplierMaterialName().isBlank()) {
                        requestNameValue = rm.getSupplierMaterialName();
                    } else if (rm.getMaterial() != null && rm.getMaterial().getName() != null) {
                        requestNameValue = rm.getMaterial().getName();
                    } else if (rm.getEstimateMaterialName() != null && !rm.getEstimateMaterialName().isBlank()) {
                        requestNameValue = rm.getEstimateMaterialName();
                    }
                }
                if (requestNameValue.isEmpty()) {
                    requestNameValue = item.getDescription() != null ? item.getDescription() : "";
                }
                descCell.setCellValue(requestNameValue);
                descCell.setCellStyle(dataStyle);
                
                Cell qtyCell = dataRow.createCell(2);
                qtyCell.setCellValue(item.getQuantity() != null ? item.getQuantity() : 0);
                qtyCell.setCellStyle(dataStyle);
                
                Cell unitCell = dataRow.createCell(3);
                unitCell.setCellValue(item.getUnit() != null && item.getUnit().getName() != null ? item.getUnit().getName() : "");
                unitCell.setCellStyle(dataStyle);
                
                // Сметное наименование
                String estimateName = (item.getRequestMaterial() != null && item.getRequestMaterial().getEstimateMaterialName() != null)
                        ? item.getRequestMaterial().getEstimateMaterialName() : "";
                Cell estimateNameCell = dataRow.createCell(4);
                estimateNameCell.setCellValue(estimateName);
                estimateNameCell.setCellStyle(dataStyle);

                // Сметная цена
                Double estimatePrice = (item.getRequestMaterial() != null) ? item.getRequestMaterial().getEstimatePrice() : null;
                Cell priceCell = dataRow.createCell(5);
                priceCell.setCellValue(estimatePrice != null ? estimatePrice : (item.getEstimatedPrice() != null ? item.getEstimatedPrice() : 0));
                priceCell.setCellStyle(priceStyle);
                
                double estimatedTotal = 0;
                Double estimateQty = (item.getRequestMaterial() != null) ? item.getRequestMaterial().getEstimateQuantity() : null;
                Double totalQty = estimateQty != null ? estimateQty : item.getQuantity();
                Double unitPrice = estimatePrice != null ? estimatePrice : item.getEstimatedPrice();
                if (unitPrice != null && totalQty != null) {
                    estimatedTotal = unitPrice * totalQty;
                }
                // Сметная стоимость
                Cell totalCell = dataRow.createCell(6);
                totalCell.setCellValue(estimatedTotal);
                totalCell.setCellStyle(priceStyle);

                // Лучшая цена за единицу по правилу 3>2>1 и лучший поставщик
                double bestPrice = Double.MAX_VALUE; // эффективная за единицу
                String bestSupplierName = "";
                for (int i = 0; i < proposals.size(); i++) {
                    SupplierProposal p = proposals.get(i);
                    ProposalItem pi = findProposalItem(p, item);
                    if (pi != null) {
                        double v = calculateEffectiveUnitForBest(pi);
                        if (v < bestPrice) {
                            bestPrice = v;
                            bestSupplierName = (p.getSupplier() != null && p.getSupplier().getName() != null) ? p.getSupplier().getName() : "";
                        }
                    }
                }
                if (bestPrice == Double.MAX_VALUE) bestPrice = 0.0;
                Cell bestPriceCell = dataRow.createCell(7);
                bestPriceCell.setCellValue(bestPrice);
                bestPriceCell.setCellStyle(priceStyle);

                // Поставщик (лучший)
                Cell bestSupplierCell = dataRow.createCell(8);
                bestSupplierCell.setCellValue(bestSupplierName);
                bestSupplierCell.setCellStyle(dataStyle);

                // Экономия
                double bestTotalForQty = (totalQty != null ? totalQty : 0.0) * bestPrice;
                double saving = Math.max(0, estimatedTotal - bestTotalForQty);
                Cell savingCell = dataRow.createCell(9);
                savingCell.setCellValue(saving);
                savingCell.setCellStyle(priceStyle);

                // Ссылка на материал
                Cell linkCell = dataRow.createCell(10);
                String link = (item.getRequestMaterial() != null) ? item.getRequestMaterial().getMaterialLink() : null;
                if (link != null && !link.isBlank()) {
                    CreationHelper createHelper = workbook.getCreationHelper();
                    org.apache.poi.ss.usermodel.Hyperlink hyperlink = createHelper.createHyperlink(org.apache.poi.common.usermodel.HyperlinkType.URL);
                    hyperlink.setAddress(link);
                    linkCell.setHyperlink(hyperlink);
                    linkCell.setCellValue(link);
                    linkCell.setCellStyle(linkStyle);
                } else {
                    linkCell.setCellValue("");
                    linkCell.setCellStyle(dataStyle);
                }
                
                // Заполняем данные поставщиков
                colIndex = startSupplierCol;
                // № Тендера (общий для строки)
                Cell tenderNumCell = dataRow.createCell(colIndex++);
                tenderNumCell.setCellValue(tender.getTenderNumber() != null ? tender.getTenderNumber() : "");
                tenderNumCell.setCellStyle(dataStyle);
                for (SupplierProposal proposal : proposals) {
                    ProposalItem proposalItem = findProposalItem(proposal, item);

                    // Срок (дней) и Стоимость с НДС
                    if (proposalItem != null) {
                        Cell deliveryCell = dataRow.createCell(colIndex++);
                        deliveryCell.setCellValue(extractDaysFromPeriod(proposalItem.getDeliveryPeriod()));
                        deliveryCell.setCellStyle(dataStyle);

                        double delivery = proposalItem.getDeliveryCost() != null ? proposalItem.getDeliveryCost() : 0.0;
                        double priceWithVat = (delivery > 0.0)
                                ? calculateTotalWithVatAndDelivery(proposalItem)
                                : calculatePreferredTotalNoDelivery(proposalItem);
                        Cell supplierPriceCell = dataRow.createCell(colIndex++);
                        supplierPriceCell.setCellValue(priceWithVat);
                        CellStyle supplierStyle = createSupplierStyle(workbook);
                        // Подсветка лучшей цены (вариант B): если совпало с эффективной ценой за единицу
                        double effectiveUnit = calculateEffectiveUnitForBest(proposalItem);
                        if (Math.abs(effectiveUnit - bestPrice) < 0.0001) {
                            Font boldFont = workbook.createFont();
                            boldFont.setBold(true);
                            supplierStyle.setFont(boldFont);
                        }
                        supplierPriceCell.setCellStyle(supplierStyle);

                        // Комментарий с визуализацией расчета (правило 3>2>1)
                        try {
                            Drawing<?> drawing = sheet.createDrawingPatriarch();
                            CreationHelper helper = workbook.getCreationHelper();
                            ClientAnchor anchor = helper.createClientAnchor();
                            anchor.setCol1(supplierPriceCell.getColumnIndex());
                            anchor.setRow1(dataRow.getRowNum());
                            Comment comment = drawing.createCellComment(anchor);
                            comment.setString(helper.createRichTextString(buildCalculationComment(proposalItem)));
                            supplierPriceCell.setCellComment(comment);
                        } catch (Exception ignore) {
                        }
                    } else {
                        Cell emptyDeliveryCell = dataRow.createCell(colIndex++);
                        emptyDeliveryCell.setCellValue("");
                        emptyDeliveryCell.setCellStyle(dataStyle);

                        Cell emptyPriceCell = dataRow.createCell(colIndex++);
                        emptyPriceCell.setCellValue("");
                        emptyPriceCell.setCellStyle(createSupplierStyle(workbook));
                    }
                }
            }
            
            // Итоговая строка
            Row totalRow = sheet.createRow(rowIndex);
            Cell totalLabel = totalRow.createCell(0);
            totalLabel.setCellValue("Итого:");
            totalLabel.setCellStyle(headerStyle);

            double totalEstimated = tenderItems.stream()
                    .map(item -> {
                        Double estQty = (item.getRequestMaterial() != null) ? item.getRequestMaterial().getEstimateQuantity() : null;
                        Double estPrice = (item.getRequestMaterial() != null) ? item.getRequestMaterial().getEstimatePrice() : null;
                        Double q = estQty != null ? estQty : item.getQuantity();
                        Double p = estPrice != null ? estPrice : item.getEstimatedPrice();
                        return (q != null && p != null) ? q * p : 0.0;
                    })
                    .mapToDouble(Double::doubleValue)
                    .sum();

            // сметная стоимость теперь в колонке 6
            Cell totalEstimatedCell = totalRow.createCell(6);
            totalEstimatedCell.setCellValue(totalEstimated);
            totalEstimatedCell.setCellStyle(priceStyle);

            // Итоги по поставщикам (в колонках цены групп) — по правилу 3 (включая доставку)
            int totalCol = startSupplierCol;
            totalCol++; // пропустить колонку № Тендера
            for (SupplierProposal proposal : proposals) {
                totalCol++; // срок
                double supplierSum = proposalItemRepository.findBySupplierProposalIdWithTenderItem(proposal.getId())
                        .stream()
                        .mapToDouble(this::calculateTotalWithVatAndDelivery)
                        .sum();
                Cell supTotalCell = totalRow.createCell(totalCol++);
                supTotalCell.setCellValue(supplierSum);
                supTotalCell.setCellStyle(priceStyle);
            }

            // Автоматически подгоняем ширину колонок (с ограничением)
            try {
                autoSizeColumns(sheet, baseCols, proposals.size());
            } catch (Exception e) {
                log.warn("Не удалось автоматически подогнать ширину колонок: {}", e.getMessage());
            }
            
            // Сохраняем в ByteArrayOutputStream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            log.info("Экспорт анализа цен в Excel завершен успешно для тендера: {}", tenderId);
            return outputStream;
            
        } catch (Exception e) {
            log.error("Ошибка при экспорте анализа цен в Excel для тендера: {}", tenderId, e);
            throw new RuntimeException("Ошибка при создании Excel отчета", e);
        }
    }

    @Transactional(readOnly = true)
    public ByteArrayOutputStream exportRequestTendersToExcel(UUID requestId) {
        log.info("Экспорт Excel по всем тендерам заявки: {}", requestId);
        List<Tender> tenders = tenderRepository.findAllByRequestId(requestId);
        if (tenders == null || tenders.isEmpty()) {
            throw new RuntimeException("У заявки нет тендеров");
        }
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Анализ цен (заявка)");

            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle supplierHeaderStyle = createSupplierHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle priceStyle = createPriceStyle(workbook);

            // Собираем уникальных поставщиков и их лучшую цену (min эффективной цены за ед.)
            Map<UUID, String> supplierIdToName = new LinkedHashMap<>();
            Map<UUID, Double> supplierIdToBestUnit = new HashMap<>();
            Map<UUID, String> supplierIdToComment = new HashMap<>();

            class SupplierAgg { double totalPrice = 0.0; Integer minDays = null; String proposalNumber = null; }
            class GroupRow {
                String displayName = "";
                String estimateName = "";
                String unitName = "";
                double totalQty = 0.0;
                double estimatedTotal = 0.0;
                String link = "";
                double bestUnit = Double.MAX_VALUE;
                String bestSupplierName = "";
                Map<UUID, SupplierAgg> perSupplier = new HashMap<>();
                java.util.Set<String> tenderNumbers = new java.util.LinkedHashSet<>();
            }

            Map<String, GroupRow> keyToGroup = new LinkedHashMap<>();

            for (Tender tender : tenders) {
                List<TenderItem> items = tenderItemRepository.findByTenderIdWithUnit(tender.getId());
                List<SupplierProposal> proposals = supplierProposalRepository.findByTenderIdWithSupplier(tender.getId());
                // учтём поставщиков
                for (SupplierProposal p : proposals) {
                    if (p.getSupplier() != null) {
                        supplierIdToName.putIfAbsent(p.getSupplier().getId(), p.getSupplier().getName());
                        String comment = Optional.ofNullable(p.getCommercialTerms()).filter(s -> !s.isBlank())
                                .orElse(Optional.ofNullable(p.getCoverLetter()).orElse(""));
                        if (!comment.isBlank()) {
                            supplierIdToComment.put(p.getSupplier().getId(), comment);
                        }
                    }
                }
                for (TenderItem item : items) {
                    // ключ группы
                    String key = buildGroupKey(item);
                    GroupRow g = keyToGroup.computeIfAbsent(key, k -> new GroupRow());
                    if (g.displayName.isEmpty()) g.displayName = resolveRequestMaterialName(item);
                    if (g.unitName.isEmpty()) g.unitName = item.getUnit() != null && item.getUnit().getName() != null ? item.getUnit().getName() : "";
                    if (g.estimateName.isEmpty() && item.getRequestMaterial() != null && item.getRequestMaterial().getEstimateMaterialName() != null) {
                        g.estimateName = item.getRequestMaterial().getEstimateMaterialName();
                    }
                    if (g.link.isEmpty()) {
                        String link = (item.getRequestMaterial() != null) ? item.getRequestMaterial().getMaterialLink() : null;
                        if (link != null && !link.isBlank()) g.link = link;
                    }

                    double qty = item.getQuantity() != null ? item.getQuantity() : 0.0;
                    g.totalQty += qty;
                    Double estQty = (item.getRequestMaterial() != null) ? item.getRequestMaterial().getEstimateQuantity() : null;
                    Double estPrice = (item.getRequestMaterial() != null) ? item.getRequestMaterial().getEstimatePrice() : null;
                    Double q = estQty != null ? estQty : item.getQuantity();
                    Double p = estPrice != null ? estPrice : item.getEstimatedPrice();
                    if (q != null && p != null) g.estimatedTotal += q * p;
                    // Номер текущего тендера для группы
                    if (tender.getTenderNumber() != null && !tender.getTenderNumber().isBlank()) {
                        g.tenderNumbers.add(tender.getTenderNumber());
                    }

                    // обходим поставщиков этого тендера
                    for (SupplierProposal psp : proposals) {
                        if (psp.getSupplier() == null) continue;
                        UUID supplierId = psp.getSupplier().getId();
                        ProposalItem pi = findProposalItem(psp, item);
                        if (pi == null) continue;
                        double effUnit = calculateEffectiveUnitForBest(pi);
                        supplierIdToBestUnit.merge(supplierId, effUnit, Math::min);
                        if (effUnit < g.bestUnit) {
                            g.bestUnit = effUnit;
                            g.bestSupplierName = psp.getSupplier().getName();
                        }

                        SupplierAgg agg = g.perSupplier.computeIfAbsent(supplierId, id -> new SupplierAgg());
                        double total = (pi.getDeliveryCost() != null && pi.getDeliveryCost() > 0)
                                ? calculateTotalWithVatAndDelivery(pi)
                                : calculatePreferredTotalNoDelivery(pi);
                        agg.totalPrice += total;
                        int days = extractDaysFromPeriod(pi.getDeliveryPeriod());
                        agg.minDays = agg.minDays == null ? days : Math.min(agg.minDays, days);
                        if (agg.proposalNumber == null || (psp.getProposalNumber() != null && !psp.getProposalNumber().isBlank())) {
                            agg.proposalNumber = psp.getProposalNumber();
                        }
                    }
                }
            }

            // Упорядочиваем поставщиков по убыванию их лучшей (минимальной) цены за ед.
            List<UUID> orderedSuppliers = new ArrayList<>(supplierIdToName.keySet());
            orderedSuppliers.sort((a, b) -> {
                double va = supplierIdToBestUnit.getOrDefault(a, Double.MAX_VALUE);
                double vb = supplierIdToBestUnit.getOrDefault(b, Double.MAX_VALUE);
                return Double.compare(vb, va); // по убыванию
            });

            // Заголовок с номером заявки
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            String reqNum = tenders.get(0).getRequest() != null ? tenders.get(0).getRequest().getRequestNumber() : "-";
            String reqDate = (tenders.get(0).getRequest() != null && tenders.get(0).getRequest().getDate() != null)
                    ? tenders.get(0).getRequest().getDate().toString() : "";
            titleCell.setCellValue("Тендеры по заявке № " + reqNum + "  от  " + reqDate);
            titleCell.setCellStyle(titleStyle);

            int baseCols = 11;
            int lastCol = baseCols + 1 + (orderedSuppliers.size() * 3) - 1;
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, Math.max(lastCol, 0)));

            // Строка 1: комментарии (оставим пустыми)
            Row commentsRow = sheet.createRow(2);
            commentsRow.createCell(baseCols-10).setCellValue("Заказчик:");
            commentsRow.createCell(baseCols-9).setCellValue(tenders.get(0).getRequest() != null ? tenders.get(0).getRequest().getOrganization().getShortName() : "");
            commentsRow.createCell(baseCols-8).setCellValue("Проект:");
            commentsRow.createCell(baseCols-7).setCellValue(tenders.get(0).getRequest() != null ? tenders.get(0).getRequest().getProject().getName() : "");
            commentsRow.createCell(baseCols-6).setCellValue("Склад:");
            commentsRow.createCell(baseCols-5).setCellValue(tenders.get(0).getRequest() != null ? tenders.get(0).getRequest().getWarehouse().getName() : "");


            commentsRow.createCell(baseCols).setCellValue("Комментарий:");
            int commentsStart = baseCols + 1;
            for (int i = 0; i < orderedSuppliers.size(); i++) {
                int from = commentsStart + i * 3;
                int to = from + 2;
                String comment = supplierIdToComment.getOrDefault(orderedSuppliers.get(i), "");
                Cell c = commentsRow.createCell(from);
                c.setCellValue(comment);
                c.setCellStyle(dataStyle);
                commentsRow.createCell(from + 1).setCellStyle(dataStyle);
                commentsRow.createCell(to).setCellStyle(dataStyle);
                sheet.addMergedRegion(new CellRangeAddress(3, 3, from, to));
            }

            // Строка 4: поставщики
            Row supplierRow = sheet.createRow(1);
            int labelCol = baseCols - 10;
            supplierRow.createCell(labelCol).setCellValue("Тендера по заявке:");
            supplierRow.createCell(labelCol+1).setCellValue(tenders.get(0).getRequest() != null ? tenders.get(0).getRequest().getRequestNumber() : "");
            supplierRow.createCell(labelCol+2).setCellValue("от");
            supplierRow.createCell(labelCol+3).setCellValue(tenders.get(0).getRequest() != null ? tenders.get(0).getRequest().getDate().toString() : "");
            supplierRow.createCell(labelCol+4).setCellValue("Исполнитель");
            supplierRow.createCell(labelCol+5).setCellValue(tenders.get(0).getRequest() != null ? tenders.get(0).getRequest().getPerformer() : "");

            supplierRow.createCell(baseCols).setCellValue("Поставщик:");
            int supplierStart = baseCols + 1;
            for (int i = 0; i < orderedSuppliers.size(); i++) {
                int from = supplierStart + i * 3;
                int to = from + 2;
                Cell cell = supplierRow.createCell(from);
                cell.setCellValue(supplierIdToName.get(orderedSuppliers.get(i)));
                cell.setCellStyle(supplierHeaderStyle);
                // заполняем 2 ячейки для корректного merge
                supplierRow.createCell(from + 1).setCellStyle(supplierHeaderStyle);
                supplierRow.createCell(to).setCellStyle(supplierHeaderStyle);
                sheet.addMergedRegion(new CellRangeAddress(4, 4, from, to));
            }



            // Строка заголовков колонок
            final String[] baseHeaders = new String[] {
                    "№ п/п", "Наименование материала, услуги по Заявке", "Кол-во", "Ед. изм.",
                    "Сметное наименование", "Сметная цена", "Сметная Стоимость",
                    "Лучшая цена", "Поставщик (лучший)", "Экономия", "Ссылка на Материал"
            };
            Row headerRow = sheet.createRow(5);
            for (int i = 0; i < baseHeaders.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(baseHeaders[i]);
                c.setCellStyle(headerStyle);
            }
            int startSupplierCol = baseCols;
            Cell tenderNumHeader = headerRow.createCell(startSupplierCol++);
            tenderNumHeader.setCellValue("№ Тендера");
            tenderNumHeader.setCellStyle(headerStyle);
            for (int i = 0; i < orderedSuppliers.size(); i++) {
                Cell acc = headerRow.createCell(startSupplierCol++);
                acc.setCellValue("Счет");
                acc.setCellStyle(headerStyle);
                Cell d = headerRow.createCell(startSupplierCol++);
                d.setCellValue("Срок (дней)");
                d.setCellStyle(headerStyle);
                Cell p = headerRow.createCell(startSupplierCol++);
                p.setCellValue("Стоимость с НДС (руб.)");
                p.setCellStyle(headerStyle);
            }

            // Данные по сгруппированным материалам
            int rowIndex = 6;
            int idx = 1;
            for (GroupRow g : keyToGroup.values()) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(idx++);
                row.createCell(1).setCellValue(g.displayName);
                row.createCell(2).setCellValue(g.totalQty);
                row.createCell(3).setCellValue(g.unitName);
                row.createCell(4).setCellValue(g.estimateName);
                // Сметная цена (оставим пустой если разная; используем средневзвешенную)
                double unitEstimate = g.totalQty > 0 ? (g.estimatedTotal / g.totalQty) : 0.0;
                Cell estPriceCell = row.createCell(5);
                estPriceCell.setCellValue(unitEstimate);
                estPriceCell.setCellStyle(priceStyle);
                Cell estTotalCell = row.createCell(6);
                estTotalCell.setCellValue(g.estimatedTotal);
                estTotalCell.setCellStyle(priceStyle);

                double bestUnit = g.bestUnit == Double.MAX_VALUE ? 0.0 : g.bestUnit;
                Cell bestPriceCell = row.createCell(7);
                bestPriceCell.setCellValue(bestUnit);
                bestPriceCell.setCellStyle(priceStyle);
                row.createCell(8).setCellValue(g.bestSupplierName);
                double saving = Math.max(0, g.estimatedTotal - (bestUnit * g.totalQty));
                Cell savingCell = row.createCell(9);
                savingCell.setCellValue(saving);
                savingCell.setCellStyle(priceStyle);
                row.createCell(10).setCellValue(g.link);

                int col = baseCols;
                // № Тендера — перечислим все номера тендеров, участвующих в группе
                String joinedTenders = String.join(", ", g.tenderNumbers);
                row.createCell(col++).setCellValue(joinedTenders);
                for (UUID supplierId : orderedSuppliers) {
                    SupplierAgg agg = g.perSupplier.get(supplierId);
                    if (agg != null) {
                        row.createCell(col++).setCellValue(agg.proposalNumber != null ? agg.proposalNumber : "");
                        row.createCell(col++).setCellValue(agg.minDays != null ? agg.minDays : 0);
                        Cell supTotalCell = row.createCell(col++);
                        supTotalCell.setCellValue(agg.totalPrice);
                        supTotalCell.setCellStyle(priceStyle);
                    } else {
                        row.createCell(col++).setCellValue("");
                        row.createCell(col++).setCellValue("");
                        row.createCell(col++).setCellValue("");
                    }
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out;
        } catch (Exception e) {
            log.error("Ошибка Excel по заявке {}", requestId, e);
            throw new RuntimeException(e);
        }
    }

    private String buildGroupKey(TenderItem item) {
        try {
            if (item.getRequestMaterial() != null && item.getRequestMaterial().getMaterial() != null && item.getRequestMaterial().getMaterial().getId() != null) {
                return "MAT:" + item.getRequestMaterial().getMaterial().getId();
            }
            String name = resolveRequestMaterialName(item).trim().toLowerCase();
            String unit = item.getUnit() != null && item.getUnit().getName() != null ? item.getUnit().getName().trim().toLowerCase() : "";
            return "NAME:" + name + "|U:" + unit;
        } catch (Exception e) {
            return "FALLBACK:" + (item.getId() != null ? item.getId().toString() : UUID.randomUUID());
        }
    }

    private String resolveRequestMaterialName(TenderItem item) {
        if (item.getRequestMaterial() != null) {
            var rm = item.getRequestMaterial();
            if (rm.getSupplierMaterialName() != null && !rm.getSupplierMaterialName().isBlank()) return rm.getSupplierMaterialName();
            if (rm.getMaterial() != null && rm.getMaterial().getName() != null) return rm.getMaterial().getName();
            if (rm.getEstimateMaterialName() != null && !rm.getEstimateMaterialName().isBlank()) return rm.getEstimateMaterialName();
        }
        return item.getDescription() != null ? item.getDescription() : "";
    }
    
    // Legacy helpers kept for reference (not used in the simplified build)
    private int createReportHeader(Sheet sheet, Tender tender, CellStyle headerStyle, CellStyle titleStyle, int startRow) {
        int rowNum = startRow;
        
        // Заголовок отчета
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Тендер по заявке №" + (tender.getRequest() != null ? tender.getRequest().getRequestNumber() : "N/A"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum-1, rowNum-1, 0, 15));
        
        // Информация о тендере
        Row infoRow1 = sheet.createRow(rowNum++);
        infoRow1.createCell(0).setCellValue("Заказчик:");
        infoRow1.createCell(1).setCellValue(tender.getCustomer() != null ? tender.getCustomer().getName() : "N/A");
        infoRow1.createCell(8).setCellValue("Исполнитель:");
        infoRow1.createCell(9).setCellValue("Жданов Ю.Я.");
        
        Row infoRow2 = sheet.createRow(rowNum++);
        infoRow2.createCell(0).setCellValue("Проект:");
        infoRow2.createCell(1).setCellValue(tender.getTitle());
        infoRow2.createCell(8).setCellValue("Поставщик:");
        infoRow2.createCell(9).setCellValue("");
        
        Row infoRow3 = sheet.createRow(rowNum++);
        infoRow3.createCell(0).setCellValue("Склад:");
        infoRow3.createCell(1).setCellValue(tender.getWarehouse() != null ? tender.getWarehouse().getName() : "N/A");
        infoRow3.createCell(8).setCellValue("Комментарий:");
        infoRow3.createCell(9).setCellValue("");
        
        // Пустая строка
        rowNum++;
        
        return rowNum;
    }
    
    private int createColumnHeaders(Sheet sheet, List<SupplierProposal> proposals, CellStyle headerStyle, int startRow) {
        int rowNum = startRow;
        
        Row headerRow = sheet.createRow(rowNum++);
        
        // Основные колонки
        String[] mainHeaders = {
            "№ п/п", "Наименование материала, услуги по Заявке", "Кол-во", "Ед. изм.",
            "Наименование материала, услуги по Смете", "Характеристики материала по Смете",
            "Кол-во (Смета)", "Ед. изм. (Смета)", "Сметная цена", "Сметная Стоимость", "Ссылка на Материал"
        };
        
        for (int i = 0; i < mainHeaders.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(mainHeaders[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Колонки поставщиков
        int colIndex = mainHeaders.length;
        for (SupplierProposal proposal : proposals) {
            // № Тендера
            Cell cell1 = headerRow.createCell(colIndex++);
            cell1.setCellValue("№ Тендера");
            cell1.setCellStyle(headerStyle);
            
            // Срок (дней)
            Cell cell2 = headerRow.createCell(colIndex++);
            cell2.setCellValue("Срок (дней)");
            cell2.setCellStyle(headerStyle);
            
            // Стоимость с НДС (руб.)
            Cell cell3 = headerRow.createCell(colIndex++);
            cell3.setCellValue("Стоимость с НДС (руб.)");
            cell3.setCellStyle(headerStyle);
        }
        
        return rowNum;
    }
    
    private int fillDataRows(Sheet sheet, List<TenderItem> tenderItems, List<SupplierProposal> proposals, 
                           CellStyle dataStyle, CellStyle priceStyle, CellStyle supplierStyle, int startRow) {
        int rowNum = startRow;
        
        for (int i = 0; i < tenderItems.size(); i++) {
            TenderItem item = tenderItems.get(i);
            Row row = sheet.createRow(rowNum++);
            
            // № п/п
            row.createCell(0).setCellValue(i + 1);
            
            // Наименование материала, услуги по Заявке
            row.createCell(1).setCellValue(item.getDescription());
            
            // Кол-во
            if (item.getQuantity() != null) {
                row.createCell(2).setCellValue(item.getQuantity());
            }
            
            // Ед. изм.
            if (item.getUnit() != null) {
                row.createCell(3).setCellValue(item.getUnit().getName());
            }
            
            // Наименование материала, услуги по Смете
            row.createCell(4).setCellValue(item.getDescription());
            
            // Характеристики материала по Смете
            row.createCell(5).setCellValue(item.getSpecifications());
            
            // Кол-во (Смета)
            if (item.getQuantity() != null) {
                row.createCell(6).setCellValue(item.getQuantity());
            }
            
            // Ед. изм. (Смета)
            if (item.getUnit() != null) {
                row.createCell(7).setCellValue(item.getUnit().getName());
            }
            
            // Сметная цена
            if (item.getEstimatedPrice() != null) {
                Cell priceCell = row.createCell(8);
                priceCell.setCellValue(item.getEstimatedPrice());
                priceCell.setCellStyle(priceStyle);
            }
            
            // Сметная Стоимость
            if (item.getEstimatedPrice() != null && item.getQuantity() != null) {
                Cell totalCell = row.createCell(9);
                double total = item.getEstimatedPrice() * item.getQuantity();
                totalCell.setCellValue(total);
                totalCell.setCellStyle(priceStyle);
            }
            
            // Ссылка на Материал
            row.createCell(10).setCellValue("https://example.com/material/" + item.getId());
            
            // Данные поставщиков
            int colIndex = 11;
            for (SupplierProposal proposal : proposals) {
                // Находим позицию для этого поставщика
                ProposalItem proposalItem = findProposalItem(proposal, item);
                
                // № Тендера
                row.createCell(colIndex++).setCellValue("");
                
                // Срок (дней)
                if (proposalItem != null && proposalItem.getDeliveryPeriod() != null) {
                    row.createCell(colIndex++).setCellValue(extractDaysFromPeriod(proposalItem.getDeliveryPeriod()));
                } else {
                    row.createCell(colIndex++).setCellValue("");
                }
                
                // Стоимость с НДС (руб.)
                if (proposalItem != null) {
                    Cell supplierPriceCell = row.createCell(colIndex++);
                    double priceWithVat = calculatePriceWithVat(proposalItem);
                    supplierPriceCell.setCellValue(priceWithVat);
                    supplierPriceCell.setCellStyle(supplierStyle);
                } else {
                    row.createCell(colIndex++).setCellValue("");
                }
            }
        }
        
        return rowNum;
    }
    
    private void createTotalRow(Sheet sheet, List<TenderItem> tenderItems, List<SupplierProposal> proposals, 
                              CellStyle headerStyle, CellStyle priceStyle, int startRow) {
        Row totalRow = sheet.createRow(startRow);
        
        // Итого
        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("Итого:");
        totalLabelCell.setCellStyle(headerStyle);
        
        // Сметная стоимость
        double totalEstimated = tenderItems.stream()
                .filter(item -> item.getEstimatedPrice() != null && item.getQuantity() != null)
                .mapToDouble(item -> item.getEstimatedPrice() * item.getQuantity())
                .sum();
        
        Cell totalEstimatedCell = totalRow.createCell(9);
        totalEstimatedCell.setCellValue(totalEstimated);
        totalEstimatedCell.setCellStyle(priceStyle);
        
        // Итого по поставщикам
        int colIndex = 11;
        for (SupplierProposal proposal : proposals) {
            colIndex += 2; // Пропускаем № Тендера и Срок
            
            double totalSupplierPrice = calculateTotalSupplierPrice(proposal, tenderItems);
            Cell totalSupplierCell = totalRow.createCell(colIndex++);
            totalSupplierCell.setCellValue(totalSupplierPrice);
            totalSupplierCell.setCellStyle(priceStyle);
        }
    }
    
    private ProposalItem findProposalItem(SupplierProposal proposal, TenderItem tenderItem) {
        List<ProposalItem> items = proposalItemRepository.findBySupplierProposalIdWithTenderItem(proposal.getId());
        return items.stream()
                .filter(item -> item.getTenderItem() != null && item.getTenderItem().getId().equals(tenderItem.getId()))
                .findFirst()
                .orElse(null);
    }
    
    private int extractDaysFromPeriod(String period) {
        if (period == null || period.isEmpty()) {
            return 0;
        }
        
        // Простая логика извлечения дней из строки типа "30 дней"
        try {
            String[] parts = period.split("\\s+");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].matches("\\d+")) {
                    return Integer.parseInt(parts[i]);
                }
            }
        } catch (Exception e) {
            log.warn("Не удалось извлечь количество дней из периода: {}", period);
        }
        
        return 0;
    }
    
    private double calculatePriceWithVat(ProposalItem item) {
        if (item.getQuantity() == null) {
            return 0.0;
        }
        double unitWithVat = calculateUnitPriceWithVat(item);
        return unitWithVat * item.getQuantity();
    }

    // Возвращает предпочтительную общую стоимость БЕЗ доставки: если есть явная цена с НДС — берем её * qty, иначе БАЗА*1.2 * qty
    private double calculatePreferredTotalNoDelivery(ProposalItem item) {
        double qty = item.getQuantity() != null ? item.getQuantity() : 0.0;
        Double explicitVatUnit = item.getUnitPriceWithVat();
        if (explicitVatUnit != null) {
            return explicitVatUnit * qty;
        }
        return calculatePriceWithVat(item);
    }

    // Возвращает цену за единицу по правилу НДС: если указана явная unitPriceWithVat — берем её, иначе считаем, что компания без НДС (берем базовую)
    private double calculateUnitPriceWithVat(ProposalItem item) {
        Double explicitVatUnit = item.getUnitPriceWithVat();
        if (explicitVatUnit != null) {
            return explicitVatUnit;
        }
        if (item.getUnitPrice() == null) {
            return 0.0;
        }
        return item.getUnitPrice();
    }

    // Правило выбора эффективной цены за единицу для лучшей цены: 3 > 2 > 1
    // 3) Если есть доставка: (цена с НДС если есть, иначе базовая) + доставка/кол-во (если кол-во > 0)
    // 2) Иначе, если указана цена с НДС — берем её
    // 1) Иначе — базовая цена
    private double calculateEffectiveUnitForBest(ProposalItem item) {
        Double quantity = item.getQuantity();
        double base = item.getUnitPrice() != null ? item.getUnitPrice() : 0.0;
        Double explicitVatUnit = item.getUnitPriceWithVat();
        Double delivery = item.getDeliveryCost();

        boolean hasDelivery = delivery != null && delivery > 0.0;
        if (hasDelivery) {
            double chosenUnit = explicitVatUnit != null ? explicitVatUnit : base;
            double perUnitDelivery = (quantity != null && quantity > 0.0) ? (delivery / quantity) : delivery != null ? delivery : 0.0;
            return chosenUnit + perUnitDelivery;
        }
        if (explicitVatUnit != null) {
            return explicitVatUnit;
        }
        return base;
    }

    private String buildCalculationComment(ProposalItem item) {
        Double quantity = item.getQuantity();
        double base = item.getUnitPrice() != null ? item.getUnitPrice() : 0.0;
        Double explicitVatUnit = item.getUnitPriceWithVat();
        Double delivery = item.getDeliveryCost();
        boolean hasDelivery = delivery != null && delivery > 0.0;

        String rule;
        double effective = calculateEffectiveUnitForBest(item);
        if (hasDelivery) {
            rule = "Правило 3: цена+доставка";
        } else if (explicitVatUnit != null) {
            rule = "Правило 2: цена с НДС";
        } else {
            rule = "Правило 1: базовая цена";
        }
        String vatPart = explicitVatUnit != null ? String.format("С НДС (явная): %.2f", explicitVatUnit) : "Без НДС (явная отсутствует)";
        double perUnitDelivery = (quantity != null && quantity > 0.0 && delivery != null) ? (delivery / quantity) : (delivery != null ? delivery : 0.0);
        return String.format("База: %.2f; %s; Доставка: %.2f; Эффективная (за ед.): %.2f; %s", base, vatPart, (delivery != null ? delivery : 0.0), effective, rule);
    }
    
    private double calculateTotalSupplierPrice(SupplierProposal proposal, List<TenderItem> tenderItems) {
        List<ProposalItem> items = proposalItemRepository.findBySupplierProposalIdWithTenderItem(proposal.getId());
        
        return items.stream()
                .filter(item -> item.getTenderItem() != null)
                .mapToDouble(this::calculateTotalWithVatAndDelivery)
                .sum();
    }

    private double calculateTotalWithVatAndDelivery(ProposalItem item) {
        double unitWithVat = calculateUnitPriceWithVat(item);
        double qty = item.getQuantity() != null ? item.getQuantity() : 0.0;
        double totalWithVat = unitWithVat * qty;
        double delivery = item.getDeliveryCost() != null ? item.getDeliveryCost() : 0.0;
        return totalWithVat + delivery;
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
    
    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    private CellStyle createSupplierHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
    
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createPriceStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0.00"));
        return style;
    }
    
    private CellStyle createSupplierStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0.00"));
        return style;
    }

    private CellStyle createHyperlinkStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        Font linkFont = workbook.createFont();
        linkFont.setUnderline(Font.U_SINGLE);
        linkFont.setColor(IndexedColors.BLUE.getIndex());
        style.setFont(linkFont);
        return style;
    }
    
    private void autoSizeColumns(Sheet sheet, int baseCols, int supplierCount) {
        // Автоматически подгоняем ширину основных колонок (с ограничением)
        int maxColumns = Math.min(baseCols, 50); // Ограничиваем до 50 колонок
        for (int i = 0; i < maxColumns; i++) {
            try {
                sheet.autoSizeColumn(i);
                // Ограничиваем максимальную ширину до 50 символов
                int maxWidth = 50 * 256;
                if (sheet.getColumnWidth(i) > maxWidth) {
                    sheet.setColumnWidth(i, maxWidth);
                }
            } catch (Exception e) {
                log.warn("Не удалось подогнать колонку {}: {}", i, e.getMessage());
            }
        }
        
        // Подгоняем ширину колонок поставщиков (с ограничением)
        int start = baseCols;
        int totalColumns = Math.min(baseCols + (supplierCount * 3), 100); // Ограничиваем до 100 колонок
        for (int i = start; i < totalColumns; i++) {
            try {
                sheet.autoSizeColumn(i);
                int maxWidth = 50 * 256;
                if (sheet.getColumnWidth(i) > maxWidth) {
                    sheet.setColumnWidth(i, maxWidth);
                }
            } catch (Exception e) {
                log.warn("Не удалось подогнать колонку поставщика {}: {}", i, e.getMessage());
            }
        }
    }
} 