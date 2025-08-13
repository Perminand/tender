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
import ru.perminov.tender.service.TenderWinnerService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class TenderWinnerServiceImpl implements TenderWinnerService {

    private final TenderRepository tenderRepository;
    private final TenderItemRepository tenderItemRepository;
    private final SupplierProposalRepository supplierProposalRepository;
    private final ProposalItemRepository proposalItemRepository;

    private static final double DEFAULT_VAT_RATE = 20.0; // 20% НДС по умолчанию

    @Override
    public TenderWinnerDto determineWinners(UUID tenderId) {
        log.info("Определение победителей для тендера: {}", tenderId);
        
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tenderId);
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        List<TenderItemWinnerDto> itemWinners = new ArrayList<>();
        double totalEstimatedPrice = 0.0;
        double totalWinnerPrice = 0.0;
        double totalVatAmount = 0.0;
        double totalDeliveryCost = 0.0;
        Set<UUID> winnerSuppliers = new HashSet<>();
        Set<UUID> secondPriceSuppliers = new HashSet<>();
        
        for (TenderItem tenderItem : tenderItems) {
            TenderItemWinnerDto itemWinner = determineItemWinner(tenderItem, proposals);
            itemWinners.add(itemWinner);
            
            // Суммируем общие показатели
            if (itemWinner.totalEstimatedPrice() != null) {
                totalEstimatedPrice += itemWinner.totalEstimatedPrice();
            }
            if (itemWinner.totalWinnerPrice() != null) {
                totalWinnerPrice += itemWinner.totalWinnerPrice();
            }
            
            // Добавляем поставщиков
            if (itemWinner.winner() != null) {
                winnerSuppliers.add(itemWinner.winner().supplierId());
            }
            if (itemWinner.secondPrice() != null) {
                secondPriceSuppliers.add(itemWinner.secondPrice().supplierId());
            }
            
            // Суммируем НДС и доставку
            if (itemWinner.winner() != null) {
                if (itemWinner.winner().vatAmount() != null) {
                    totalVatAmount += itemWinner.winner().vatAmount();
                }
                if (itemWinner.winner().deliveryCost() != null) {
                    totalDeliveryCost += itemWinner.winner().deliveryCost();
                }
            }
        }
        
        double totalSavings = totalEstimatedPrice - totalWinnerPrice;
        double savingsPercentage = totalEstimatedPrice > 0 ? (totalSavings / totalEstimatedPrice) * 100 : 0.0;
        
        TenderWinnerSummaryDto summary = new TenderWinnerSummaryDto(
                totalEstimatedPrice,
                totalWinnerPrice,
                totalSavings,
                savingsPercentage,
                proposals.size(),
                winnerSuppliers.size(),
                getSupplierNames(winnerSuppliers, proposals),
                getSupplierNames(secondPriceSuppliers, proposals),
                calculateAveragePriceDeviation(itemWinners),
                totalVatAmount,
                totalDeliveryCost
        );
        
        return new TenderWinnerDto(
                tenderId,
                tender.getTenderNumber(),
                tender.getTitle(),
                itemWinners,
                summary
        );
    }

    @Override
    public TenderItemWinnerDto getItemWinner(UUID tenderId, UUID itemId) {
        log.info("Получение победителя для позиции {} тендера {}", itemId, tenderId);
        
        TenderItem tenderItem = tenderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Позиция тендера не найдена"));
        
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        return determineItemWinner(tenderItem, proposals);
    }

    @Override
    public List<TenderItemWinnerDto> getAllItemWinners(UUID tenderId) {
        log.info("Получение всех победителей для тендера: {}", tenderId);
        
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tenderId);
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        return tenderItems.stream()
                .map(item -> determineItemWinner(item, proposals))
                .collect(Collectors.toList());
    }

    @Override
    public List<SupplierPriceDto> getSecondPrices(UUID tenderId) {
        log.info("Получение вторых цен для тендера: {}", tenderId);
        
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tenderId);
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        return tenderItems.stream()
                .map(item -> determineItemWinner(item, proposals))
                .filter(item -> item.secondPrice() != null)
                .map(TenderItemWinnerDto::secondPrice)
                .collect(Collectors.toList());
    }

    @Override
    public Double calculateTotalSavings(UUID tenderId) {
        log.info("Расчет общей экономии для тендера: {}", tenderId);
        
        TenderWinnerDto winners = determineWinners(tenderId);
        return winners.summary().totalSavings();
    }

    @Override
    public TenderWinnerSummaryDto getWinnerStatistics(UUID tenderId) {
        log.info("Получение статистики победителей для тендера: {}", tenderId);
        
        TenderWinnerDto winners = determineWinners(tenderId);
        return winners.summary();
    }

    private TenderItemWinnerDto determineItemWinner(TenderItem tenderItem, List<SupplierProposal> proposals) {
        List<SupplierPriceDto> allPrices = new ArrayList<>();
        
        // Собираем все цены для позиции
        for (SupplierProposal proposal : proposals) {
            List<ProposalItem> proposalItems = proposalItemRepository.findBySupplierProposalId(proposal.getId());
            
            for (ProposalItem proposalItem : proposalItems) {
                if (proposalItem.getTenderItem() != null && 
                    proposalItem.getTenderItem().getId().equals(tenderItem.getId()) &&
                    proposalItem.getUnitPrice() != null) {
                    
                    SupplierPriceDto priceDto = createEnhancedSupplierPriceDto(proposal, proposalItem, tenderItem);
                    allPrices.add(priceDto);
                }
            }
        }
        
        // Сортируем по эффективной общей цене по правилу 3>2>1:
        // 3) есть доставка → (VAT если есть иначе база) * qty + доставка
        // 2) иначе если есть VAT → VAT * qty
        // 1) иначе → база * qty
        allPrices.sort(Comparator.comparing(sp -> effectiveTotalForComparison(sp, tenderItem), Comparator.naturalOrder()));
        
        SupplierPriceDto winner = null;
        SupplierPriceDto secondPrice = null;
        
        if (!allPrices.isEmpty()) {
            SupplierPriceDto originalWinner = allPrices.get(0);
            winner = new SupplierPriceDto(
                    originalWinner.supplierId(),
                    originalWinner.supplierName(),
                    originalWinner.supplierEmail(),
                    originalWinner.proposalId(),
                    originalWinner.proposalNumber(),
                    originalWinner.tenderItemId(),
                    originalWinner.unitPrice(),
                    originalWinner.totalPrice(),
                    originalWinner.currency(),
                    originalWinner.deliveryPeriod(),
                    originalWinner.warranty(),
                    originalWinner.additionalInfo(),
                    true, // isBestPrice
                    false, // isSecondPrice
                    originalWinner.unitPriceWithVat(),
                    originalWinner.totalPriceWithVat(),
                    originalWinner.deliveryCost(),
                    originalWinner.totalPriceWithDelivery(),
                    originalWinner.totalPriceWithVatAndDelivery(),
                    originalWinner.vatRate(),
                    originalWinner.vatAmount(),
                    originalWinner.savings(),
                    originalWinner.savingsPercentage()
            );
            
            if (allPrices.size() > 1) {
                SupplierPriceDto originalSecond = allPrices.get(1);
                secondPrice = new SupplierPriceDto(
                        originalSecond.supplierId(),
                        originalSecond.supplierName(),
                        originalSecond.supplierEmail(),
                        originalSecond.proposalId(),
                        originalSecond.proposalNumber(),
                        originalSecond.tenderItemId(),
                        originalSecond.unitPrice(),
                        originalSecond.totalPrice(),
                        originalSecond.currency(),
                        originalSecond.deliveryPeriod(),
                        originalSecond.warranty(),
                        originalSecond.additionalInfo(),
                        false, // isBestPrice
                        true, // isSecondPrice
                        originalSecond.unitPriceWithVat(),
                        originalSecond.totalPriceWithVat(),
                        originalSecond.deliveryCost(),
                        originalSecond.totalPriceWithDelivery(),
                        originalSecond.totalPriceWithVatAndDelivery(),
                        originalSecond.vatRate(),
                        originalSecond.vatAmount(),
                        originalSecond.savings(),
                        originalSecond.savingsPercentage()
                );
            }
        }
        
        // Рассчитываем экономию
        double totalEstimatedPrice = (tenderItem.getEstimatedPrice() != null && tenderItem.getQuantity() != null)
                ? tenderItem.getEstimatedPrice() * tenderItem.getQuantity()
                : 0.0;
        
        double totalWinnerPrice = winner != null ? effectiveTotalForComparison(winner, tenderItem) : 0.0;
        
        double totalSavings = totalEstimatedPrice - totalWinnerPrice;
        double savingsPercentage = totalEstimatedPrice > 0 ? (totalSavings / totalEstimatedPrice) * 100 : 0.0;
        
        return new TenderItemWinnerDto(
                tenderItem.getId(),
                tenderItem.getItemNumber(),
                tenderItem.getDescription(),
                tenderItem.getQuantity(),
                tenderItem.getUnit() != null ? tenderItem.getUnit().getName() : null,
                tenderItem.getEstimatedPrice(),
                winner,
                secondPrice,
                allPrices,
                totalSavings,
                savingsPercentage,
                totalEstimatedPrice,
                totalWinnerPrice
        );
    }

    private SupplierPriceDto createEnhancedSupplierPriceDto(SupplierProposal proposal, ProposalItem item, TenderItem tenderItem) {
        // Базовые значения
        double unitBase = item.getUnitPrice() != null ? item.getUnitPrice() : 0.0;
        double quantity = item.getQuantity() != null ? item.getQuantity() : (tenderItem.getQuantity() != null ? tenderItem.getQuantity() : 0.0);
        double totalBase = unitBase * quantity;

        // Явная цена с НДС (если задана)
        Double explicitUnitWithVat = item.getUnitPriceWithVat();
        Double totalWithVat = (explicitUnitWithVat != null) ? explicitUnitWithVat * quantity : null;

        // Доставка
        double deliveryCost = item.getDeliveryCost() != null ? item.getDeliveryCost() : 0.0;
        double totalWithDelivery = totalBase + deliveryCost;
        double totalWithVatAndDelivery = (totalWithVat != null ? totalWithVat : totalBase) + deliveryCost;

        // Экономия считается относительно эффективной цены (правило 3>2>1)
        double estimatedUnit = tenderItem.getEstimatedPrice() != null ? tenderItem.getEstimatedPrice() : 0.0;
        double estimatedTotal = estimatedUnit * quantity;
        double effectiveTotal = (deliveryCost > 0)
                ? totalWithVatAndDelivery
                : (totalWithVat != null ? totalWithVat : totalBase);
        double savings = estimatedTotal - effectiveTotal;
        double savingsPercentage = estimatedTotal > 0 ? (savings / estimatedTotal) * 100 : 0.0;

        // Попробуем оценить сумму НДС, если есть явная цена с НДС и база
        Double vatAmount = (explicitUnitWithVat != null) ? (explicitUnitWithVat - unitBase) * quantity : 0.0;
        Double vatRate = (explicitUnitWithVat != null && unitBase > 0) ? ((explicitUnitWithVat / unitBase) - 1) * 100.0 : 0.0; // без НДС, если явной цены с НДС нет

        return new SupplierPriceDto(
                proposal.getSupplier().getId(),
                proposal.getSupplier().getShortName() != null ? proposal.getSupplier().getShortName() : proposal.getSupplier().getName(),
                proposal.getSupplier().getEmail(),
                proposal.getId(),
                proposal.getProposalNumber(),
                item.getTenderItem() != null ? item.getTenderItem().getId() : null,
                unitBase,
                totalBase,
                proposal.getCurrency(),
                item.getDeliveryPeriod(),
                item.getWarranty() != null ? item.getWarranty().getName() : null,
                item.getAdditionalInfo(),
                false, // isBestPrice
                false, // isSecondPrice
                explicitUnitWithVat,
                totalWithVat,
                deliveryCost,
                totalWithDelivery,
                totalWithVatAndDelivery,
                vatRate,
                vatAmount,
                savings,
                savingsPercentage
        );
    }

    private double effectiveTotalForComparison(SupplierPriceDto dto, TenderItem tenderItem) {
        double qty = tenderItem.getQuantity() != null ? tenderItem.getQuantity() : 0.0;
        double delivery = dto.deliveryCost() != null ? dto.deliveryCost() : 0.0;
        if (delivery > 0.0) {
            Double withVat = dto.totalPriceWithVat();
            return (withVat != null ? withVat : (dto.totalPrice() != null ? dto.totalPrice() : 0.0)) + delivery;
        }
        if (dto.totalPriceWithVat() != null) {
            return dto.totalPriceWithVat();
        }
        return dto.totalPrice() != null ? dto.totalPrice() : Double.MAX_VALUE;
    }

    private List<String> getSupplierNames(Set<UUID> supplierIds, List<SupplierProposal> proposals) {
        Map<UUID, String> supplierNames = proposals.stream()
                .collect(Collectors.toMap(
                        p -> p.getSupplier().getId(),
                        p -> p.getSupplier().getShortName() != null ? p.getSupplier().getShortName() : p.getSupplier().getName(),
                        (existing, replacement) -> existing
                ));
        
        return supplierIds.stream()
                .map(supplierNames::get)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    private double calculateAveragePriceDeviation(List<TenderItemWinnerDto> items) {
        return items.stream()
                .mapToDouble(TenderItemWinnerDto::savingsPercentage)
                .average()
                .orElse(0.0);
    }
}
