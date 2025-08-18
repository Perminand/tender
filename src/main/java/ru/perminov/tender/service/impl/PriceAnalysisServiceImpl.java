package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.tender.*;
import ru.perminov.tender.model.*;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.repository.TenderItemRepository;
import ru.perminov.tender.repository.SupplierProposalRepository;
import ru.perminov.tender.repository.ProposalItemRepository;
import ru.perminov.tender.service.PriceAnalysisService;
import ru.perminov.tender.service.SupplierProposalService;
import ru.perminov.tender.service.AdditionalExpenseService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PriceAnalysisServiceImpl implements PriceAnalysisService {

    private final TenderRepository tenderRepository;
    private final TenderItemRepository tenderItemRepository;
    private final SupplierProposalRepository supplierProposalRepository;
    private final ProposalItemRepository proposalItemRepository;
    private final SupplierProposalService supplierProposalService; // TODO: consider removal if remains unused
    private final AdditionalExpenseService additionalExpenseService;

    @Override
    public PriceAnalysisDto getPriceAnalysis(UUID tenderId) {
        log.info("Получен запрос на анализ цен для тендера: {}", tenderId);
        
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tenderId);
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        List<PriceAnalysisItemDto> analysisItems = new ArrayList<>();
        double totalEstimatedPrice = 0.0;
        double totalBestPrice = 0.0;
        Set<UUID> activeSuppliers = new HashSet<>();
        List<String> suppliersWithBestPrices = new ArrayList<>();
        
        for (TenderItem tenderItem : tenderItems) {
            PriceAnalysisItemDto itemAnalysis = analyzeTenderItem(tenderItem, proposals);
            analysisItems.add(itemAnalysis);
            
            double estimated = (tenderItem.getEstimatedPrice() != null && tenderItem.getQuantity() != null)
                ? tenderItem.getEstimatedPrice() * tenderItem.getQuantity()
                : 0.0;
            totalEstimatedPrice += estimated;
            if (itemAnalysis.bestPrice() != null && itemAnalysis.bestPrice().totalPrice() != null) {
                totalBestPrice += itemAnalysis.bestPrice().totalPrice();
                activeSuppliers.add(itemAnalysis.bestPrice().supplierId());
                suppliersWithBestPrices.add(itemAnalysis.bestPrice().supplierName());
            }
        }
        
        double totalSavings;
        double savingsPercentage;
        if (proposals.size() == 0) {
            totalBestPrice = 0.0;
            totalSavings = 0.0;
            savingsPercentage = 0.0;
        } else {
            totalSavings = totalEstimatedPrice - totalBestPrice;
            savingsPercentage = totalEstimatedPrice > 0 ? (totalSavings / totalEstimatedPrice) * 100 : 0.0;
        }
        
        PriceSummaryDto summary = new PriceSummaryDto(
                totalEstimatedPrice,
                totalBestPrice,
                totalSavings,
                savingsPercentage,
                proposals.size(),
                activeSuppliers.size(),
                calculateAveragePriceDeviation(analysisItems),
                suppliersWithBestPrices.stream().distinct().collect(Collectors.toList())
        );
        
        return new PriceAnalysisDto(
                tenderId,
                tender.getTenderNumber(),
                tender.getTitle(),
                analysisItems,
                summary
        );
    }

    @Override
    public List<SupplierPriceDto> getBestPricesByItems(UUID tenderId) {
        log.info("Получен запрос на лучшие цены по позициям для тендера: {}", tenderId);
        
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tenderId);
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        return tenderItems.stream()
                .map(item -> findBestPriceForItem(item, proposals))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public List<SupplierPriceDto> getPriceComparison(UUID tenderId) {
        log.info("Получен запрос на сравнительную таблицу цен для тендера: {}", tenderId);
        
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        List<SupplierPriceDto> allPrices = new ArrayList<>();
        
        for (SupplierProposal proposal : proposals) {
            List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(proposal.getId());
            
            for (ProposalItem item : items) {
                // Проверяем, что tenderItem не null и unitPrice не null
                if (item.getTenderItem() != null && item.getUnitPrice() != null) {
                    SupplierPriceDto priceDto = createSupplierPriceDto(proposal, item, false);
                    allPrices.add(priceDto);
                }
            }
        }
        
        return allPrices;
    }

    @Override
    public List<SupplierPriceDto> getSuppliersWithBestPrices(UUID tenderId) {
        log.info("Получен запрос на поставщиков с лучшими ценами для тендера: {}", tenderId);
        
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tenderId);
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        return tenderItems.stream()
                .map(item -> findBestPriceForItem(item, proposals))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public double calculateSavings(UUID tenderId) {
        log.info("Получен запрос на расчет экономии для тендера: {}", tenderId);
        
        PriceAnalysisDto analysis = getPriceAnalysis(tenderId);
        return analysis.summary().totalSavings();
    }

    @Override
    public PriceSummaryDto getPriceStatistics(UUID tenderId) {
        log.info("Получен запрос на статистику цен для тендера: {}", tenderId);
        
        PriceAnalysisDto analysis = getPriceAnalysis(tenderId);
        return analysis.summary();
    }

    @Override
    public List<SupplierPriceDto> getAnomalousPrices(UUID tenderId) {
        log.info("Получен запрос на поиск аномальных цен для тендера: {}", tenderId);
        
        List<SupplierPriceDto> allPrices = getPriceComparison(tenderId);
        List<SupplierPriceDto> anomalousPrices = new ArrayList<>();
        
        // Группируем цены по позициям тендера (tenderItemId)
        Map<UUID, List<SupplierPriceDto>> pricesByItem = allPrices.stream()
                .filter(price -> price.tenderItemId() != null) // Фильтруем null значения
                .collect(Collectors.groupingBy(SupplierPriceDto::tenderItemId));
        
        for (Map.Entry<UUID, List<SupplierPriceDto>> entry : pricesByItem.entrySet()) {
            if (entry.getKey() == null) continue; // Пропускаем null ключи
            
            List<SupplierPriceDto> itemPrices = entry.getValue();
            if (itemPrices.size() < 2) continue;
            
            // Находим среднюю цену и стандартное отклонение
            double avgPrice = itemPrices.stream()
                    .mapToDouble(SupplierPriceDto::unitPrice)
                    .average()
                    .orElse(0.0);
            
            double variance = itemPrices.stream()
                    .mapToDouble(price -> Math.pow(price.unitPrice() - avgPrice, 2))
                    .average()
                    .orElse(0.0);
            double stdDev = Math.sqrt(variance);
            
            // Находим аномальные цены (более 2 стандартных отклонений от среднего)
            for (SupplierPriceDto price : itemPrices) {
                double deviation = Math.abs(price.unitPrice() - avgPrice);
                if (deviation > 2 * stdDev) {
                    anomalousPrices.add(price);
                }
            }
        }
        
        return anomalousPrices;
    }

    @Override
    public List<String> getSupplierRecommendations(UUID tenderId) {
        log.info("Получен запрос на рекомендации по поставщикам для тендера: {}", tenderId);
        
        List<String> recommendations = new ArrayList<>();
        PriceAnalysisDto analysis = getPriceAnalysis(tenderId);
        
        // Анализируем экономию
        if (analysis.summary().totalSavings() > 0) {
            recommendations.add(String.format("Общая экономия составляет %.2f руб. (%.1f%%)", 
                    analysis.summary().totalSavings(), 
                    analysis.summary().savingsPercentage()));
        }
        
        // Анализируем количество предложений
        if (analysis.summary().totalProposals() < 3) {
            recommendations.add("Рекомендуется привлечь больше поставщиков для повышения конкуренции");
        }
        
        // Анализируем распределение лучших цен
        Set<String> bestSuppliers = new HashSet<>(analysis.summary().suppliersWithBestPrices());
        if (bestSuppliers.size() == 1) {
            recommendations.add("Внимание: один поставщик предлагает лучшие цены по всем позициям");
        }
        
        // Анализируем аномальные цены
        List<SupplierPriceDto> anomalousPrices = getAnomalousPrices(tenderId);
        if (!anomalousPrices.isEmpty()) {
            recommendations.add(String.format("Обнаружено %d аномальных цен - рекомендуется проверить", 
                    anomalousPrices.size()));
        }
        
        return recommendations;
    }

    private PriceAnalysisItemDto analyzeTenderItem(TenderItem tenderItem, List<SupplierProposal> proposals) {
        List<SupplierPriceDto> supplierPrices = new ArrayList<>();
        SupplierPriceDto bestPrice = null;
        double minTotalPrice = Double.MAX_VALUE;
        
        for (SupplierProposal proposal : proposals) {
            List<ProposalItem> proposalItems = proposalItemRepository.findBySupplierProposalId(proposal.getId());
            
            for (ProposalItem proposalItem : proposalItems) {
                // Проверяем, что tenderItem не null, соответствует текущей позиции и unitPrice не null
                if (proposalItem.getTenderItem() != null && 
                    proposalItem.getTenderItem().getId().equals(tenderItem.getId()) &&
                    proposalItem.getUnitPrice() != null) {
                    SupplierPriceDto priceDto = createSupplierPriceDto(proposal, proposalItem, false);
                    supplierPrices.add(priceDto);
                    
                    // Определяем лучшую цену по общей стоимости с учетом НДС, доставки и дополнительных расходов
                    double totalCostWithExpenses = priceDto.totalPriceWithVatAndDelivery() != null ? 
                        priceDto.totalPriceWithVatAndDelivery() : 0.0;
                    
                    // Добавляем дополнительные расходы
                    double additionalExpenses = additionalExpenseService.getTotalApprovedAmountByProposal(proposal.getId());
                    totalCostWithExpenses += additionalExpenses;
                    
                    if (totalCostWithExpenses < minTotalPrice) {
                        minTotalPrice = totalCostWithExpenses;
                        bestPrice = createSupplierPriceDto(proposal, proposalItem, true);
                    }
                }
            }
        }
        
        // Рассчитываем отклонение цены от сметной с учетом НДС и доставки
        double priceDeviation = 0.0;
        if (tenderItem.getEstimatedPrice() != null && bestPrice != null && bestPrice.totalPriceWithVatAndDelivery() != null) {
            double estimatedTotal = tenderItem.getEstimatedPrice() * (tenderItem.getQuantity() != null ? tenderItem.getQuantity() : 0.0);
            priceDeviation = ((bestPrice.totalPriceWithVatAndDelivery() - estimatedTotal) / estimatedTotal) * 100;
        }
        
        return new PriceAnalysisItemDto(
                tenderItem.getId(),
                tenderItem.getItemNumber(),
                tenderItem.getDescription(),
                tenderItem.getQuantity(),
                tenderItem.getUnit() != null ? tenderItem.getUnit().getName() : null,
                tenderItem.getEstimatedPrice(),
                supplierPrices,
                bestPrice,
                priceDeviation,
                supplierPrices.size()
        );
    }

    private SupplierPriceDto findBestPriceForItem(TenderItem tenderItem, List<SupplierProposal> proposals) {
        SupplierPriceDto bestPrice = null;
        double minTotalPrice = Double.MAX_VALUE;
        
        for (SupplierProposal proposal : proposals) {
            List<ProposalItem> proposalItems = proposalItemRepository.findBySupplierProposalId(proposal.getId());
            
            for (ProposalItem proposalItem : proposalItems) {
                // Проверяем, что tenderItem не null, соответствует текущей позиции и unitPrice не null
                if (proposalItem.getTenderItem() != null && 
                    proposalItem.getTenderItem().getId().equals(tenderItem.getId()) &&
                    proposalItem.getUnitPrice() != null) {
                    
                    SupplierPriceDto priceDto = createSupplierPriceDto(proposal, proposalItem, false);
                    
                    // Определяем лучшую цену по общей стоимости с учетом НДС, доставки и дополнительных расходов
                    double totalCostWithExpenses = priceDto.totalPriceWithVatAndDelivery() != null ? 
                        priceDto.totalPriceWithVatAndDelivery() : 0.0;
                    
                    // Добавляем дополнительные расходы
                    double additionalExpenses = additionalExpenseService.getTotalApprovedAmountByProposal(proposal.getId());
                    totalCostWithExpenses += additionalExpenses;
                    
                    if (totalCostWithExpenses < minTotalPrice) {
                        minTotalPrice = totalCostWithExpenses;
                        bestPrice = createSupplierPriceDto(proposal, proposalItem, true);
                    }
                }
            }
        }
        
        return bestPrice;
    }

    private SupplierPriceDto createSupplierPriceDto(SupplierProposal proposal, ProposalItem item, boolean isBestPrice) {
        // Базовые расчеты
        double unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : 0.0;
        double quantity = item.getQuantity() != null ? item.getQuantity() : 0.0;
        double totalPrice = unitPrice * quantity;
        
        // Правило НДС: если есть явная unitPriceWithVat — используем её; иначе считаем, что компания без НДС
        double vatRate = 0.0;
        Double explicitUnitWithVat = item.getUnitPriceWithVat();
        double unitPriceWithVat = explicitUnitWithVat != null ? explicitUnitWithVat : unitPrice;
        double totalPriceWithVat = unitPriceWithVat * quantity;
        double vatAmount = explicitUnitWithVat != null ? (totalPriceWithVat - totalPrice) : 0.0;
        
        // Расчет доставки
        double deliveryCost = item.getDeliveryCost() != null ? item.getDeliveryCost() : 0.0;
        double totalPriceWithDelivery = totalPrice + deliveryCost;
        double totalPriceWithVatAndDelivery = totalPriceWithVat + deliveryCost;
        
        return new SupplierPriceDto(
                proposal.getSupplier().getId(),
                proposal.getSupplier().getShortName() != null ? proposal.getSupplier().getShortName() : proposal.getSupplier().getName(),
                proposal.getSupplier().getEmail(),
                proposal.getId(),
                proposal.getProposalNumber(),
                item.getTenderItem() != null ? item.getTenderItem().getId() : null,
                unitPrice,
                totalPrice,
                proposal.getCurrency(),
                item.getDeliveryPeriod(),
                item.getWarranty() != null ? item.getWarranty().getName() : null,
                item.getAdditionalInfo(),
                isBestPrice,
                false, // isSecondPrice
                unitPriceWithVat,
                totalPriceWithVat,
                deliveryCost,
                totalPriceWithDelivery,
                totalPriceWithVatAndDelivery,
                vatRate,
                vatAmount,
                0.0, // savings
                0.0  // savingsPercentage
        );
    }

    private double calculateAveragePriceDeviation(List<PriceAnalysisItemDto> items) {
        return items.stream()
                .mapToDouble(PriceAnalysisItemDto::priceDeviation)
                .average()
                .orElse(0.0);
    }
} 