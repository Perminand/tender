package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.AnalyticsStatsDto;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.repository.SupplierProposalRepository;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.service.AnalyticsService;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {
    private final TenderRepository tenderRepository;
    private final SupplierProposalRepository proposalRepository;

    @Override
    public AnalyticsStatsDto getStats() {
        long totalTenders = tenderRepository.count();
        long totalProposals = proposalRepository.count();
        
        // Подсчитываем тендеры с предложениями
        long tendersWithProposals = tenderRepository.countTendersWithProposals();
        long tendersWithoutProposals = totalTenders - tendersWithProposals;
        
        // Среднее количество предложений на тендер
        double averageProposalsPerTender = totalTenders > 0 ? (double) totalProposals / totalTenders : 0.0;
        
        long activeTenders = tenderRepository.countByStatus(Tender.TenderStatus.BIDDING);
        long completedTenders = tenderRepository.countByStatus(Tender.TenderStatus.AWARDED);
        long cancelledTenders = tenderRepository.countByStatus(Tender.TenderStatus.CANCELLED);
        
        return new AnalyticsStatsDto(
                totalTenders,
                tendersWithProposals,
                tendersWithoutProposals,
                totalProposals,
                averageProposalsPerTender,
                activeTenders,
                completedTenders,
                cancelledTenders
        );
    }
} 