package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.model.TenderItem;
import ru.perminov.tender.model.TenderItemNote;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.model.ProposalItem;
import ru.perminov.tender.repository.TenderItemNoteRepository;
import ru.perminov.tender.repository.TenderItemRepository;
import ru.perminov.tender.repository.SupplierProposalRepository;
import ru.perminov.tender.repository.ProposalItemRepository;
import ru.perminov.tender.service.TenderWinnersExportService;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenderWinnersExportServiceImpl implements TenderWinnersExportService {

    private final TenderItemRepository tenderItemRepository;
    private final TenderItemNoteRepository noteRepository;
    private final SupplierProposalRepository supplierProposalRepository;
    private final ProposalItemRepository proposalItemRepository;

    @Override
    @Transactional(readOnly = true)
    public byte[] exportWinnersToExcel(UUID tenderId) {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Победители");

            CellStyle header = wb.createCellStyle();
            Font hf = wb.createFont(); hf.setBold(true); header.setFont(hf);
            header.setAlignment(HorizontalAlignment.CENTER);

            // Header
            Row h = sheet.createRow(0);
            String[] cols = {"№", "Позиция", "Кол-во", "Ед.", "Победитель", "Цена с НДС и доставкой", "Примечание"};
            for (int i = 0; i < cols.length; i++) {
                Cell c = h.createCell(i); c.setCellValue(cols[i]); c.setCellStyle(header);
            }

            List<TenderItem> items = tenderItemRepository.findByTenderIdWithUnit(tenderId);
            List<SupplierProposal> proposals = supplierProposalRepository.findByTenderIdWithSupplier(tenderId);
            int r = 1;
            for (TenderItem item : items) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(item.getItemNumber() != null ? item.getItemNumber() : r - 1);
                row.createCell(1).setCellValue(item.getDescription() != null ? item.getDescription() : "");
                row.createCell(2).setCellValue(item.getQuantity() != null ? item.getQuantity() : 0);
                row.createCell(3).setCellValue(item.getUnit() != null ? item.getUnit().getName() : "");

                // Подбор победителя и цены
                WinnerInfo winner = selectWinnerForItem(item, proposals);
                row.createCell(4).setCellValue(winner.winnerName);
                row.createCell(5).setCellValue(winner.totalWithVatAndDelivery != null ? winner.totalWithVatAndDelivery : 0);

                // Примечание для пары (item, winner)
                String note = winner.supplierId != null
                        ? noteRepository.findByTenderItemIdAndSupplierId(item.getId(), winner.supplierId)
                            .map(TenderItemNote::getNote)
                            .orElse("")
                        : "";
                row.createCell(6).setCellValue(note);
            }

            for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Ошибка экспорта победителей в Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Не удалось сформировать Excel", e);
        }
    }

    private WinnerInfo selectWinnerForItem(TenderItem tenderItem, List<SupplierProposal> proposals) {
        WinnerInfo best = new WinnerInfo();
        best.totalWithVatAndDelivery = Double.MAX_VALUE;

        // Ищем кандидатов по всем предложениям
        for (SupplierProposal proposal : proposals) {
            List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(proposal.getId());
            for (ProposalItem pi : items) {
                if (pi.getTenderItem() != null && pi.getTenderItem().getId().equals(tenderItem.getId()) && pi.getUnitPrice() != null) {
                    double candidateTotal = computeTotalWithVatAndDelivery(pi, tenderItem);
                    if (candidateTotal < best.totalWithVatAndDelivery) {
                        best.totalWithVatAndDelivery = candidateTotal;
                        best.supplierId = proposal.getSupplier() != null ? proposal.getSupplier().getId() : null;
                        best.winnerName = proposal.getSupplier() != null
                                ? (proposal.getSupplier().getShortName() != null ? proposal.getSupplier().getShortName() : proposal.getSupplier().getName())
                                : "";
                    }
                }
            }
        }

        // Если вручную назначен победитель — принудительно выбираем его (если нашли цену)
        if (tenderItem.getAwardedSupplierId() != null) {
            UUID awarded = tenderItem.getAwardedSupplierId();
            WinnerInfo enforced = new WinnerInfo();
            enforced.totalWithVatAndDelivery = null;
            for (SupplierProposal proposal : proposals) {
                if (proposal.getSupplier() != null && awarded.equals(proposal.getSupplier().getId())) {
                    List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(proposal.getId());
                    for (ProposalItem pi : items) {
                        if (pi.getTenderItem() != null && pi.getTenderItem().getId().equals(tenderItem.getId()) && pi.getUnitPrice() != null) {
                            enforced.totalWithVatAndDelivery = computeTotalWithVatAndDelivery(pi, tenderItem);
                            enforced.supplierId = awarded;
                            enforced.winnerName = proposal.getSupplier().getShortName() != null ? proposal.getSupplier().getShortName() : proposal.getSupplier().getName();
                            return enforced;
                        }
                    }
                }
            }
        }
        return best.totalWithVatAndDelivery == Double.MAX_VALUE ? new WinnerInfo() : best;
    }

    private double computeTotalWithVatAndDelivery(ProposalItem item, TenderItem tenderItem) {
        double quantity = item.getQuantity() != null ? item.getQuantity() : (tenderItem.getQuantity() != null ? tenderItem.getQuantity() : 0.0);
        double unitBase = item.getUnitPrice() != null ? item.getUnitPrice() : 0.0;
        double totalBase = unitBase * quantity;
        Double explicitUnitWithVat = item.getUnitPriceWithVat();
        Double totalWithVat = explicitUnitWithVat != null ? explicitUnitWithVat * quantity : null;
        double deliveryCost = item.getDeliveryCost() != null ? item.getDeliveryCost() : 0.0;
        return (totalWithVat != null ? totalWithVat : totalBase) + deliveryCost;
    }

    private static class WinnerInfo {
        UUID supplierId;
        String winnerName = "";
        Double totalWithVatAndDelivery;
    }
}


