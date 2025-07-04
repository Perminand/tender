package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.tender.SupplierProposalDto;
import ru.perminov.tender.dto.tender.ProposalItemDto;
import ru.perminov.tender.mapper.SupplierProposalMapper;
import ru.perminov.tender.mapper.ProposalItemMapper;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.model.ProposalItem;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.TenderItem;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.SupplierProposalRepository;
import ru.perminov.tender.repository.ProposalItemRepository;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.repository.TenderItemRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.SupplierProposalService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierProposalServiceImpl implements SupplierProposalService {

    private final SupplierProposalRepository supplierProposalRepository;
    private final ProposalItemRepository proposalItemRepository;
    private final TenderRepository tenderRepository;
    private final TenderItemRepository tenderItemRepository;
    private final CompanyRepository companyRepository;
    private final SupplierProposalMapper supplierProposalMapper;
    private final ProposalItemMapper proposalItemMapper;

    @Override
    public SupplierProposalDto createProposal(SupplierProposalDto proposalDto) {
        SupplierProposal proposal = supplierProposalMapper.toEntity(proposalDto);
        
        // Устанавливаем статус по умолчанию
        proposal.setStatus(SupplierProposal.ProposalStatus.DRAFT);
        proposal.setSubmissionDate(LocalDateTime.now());
        
        // Генерируем номер предложения если не указан
        if (proposal.getProposalNumber() == null || proposal.getProposalNumber().isEmpty()) {
            proposal.setProposalNumber("P-" + System.currentTimeMillis());
        }
        
        SupplierProposal savedProposal = supplierProposalRepository.save(proposal);
        
        // Создаем позиции предложения на основе позиций тендера
        if (proposal.getTender() != null) {
            createProposalItemsFromTender(savedProposal, proposal.getTender());
        }
        
        return supplierProposalMapper.toDto(savedProposal);
    }

    @Override
    public SupplierProposalDto updateProposal(UUID id, SupplierProposalDto proposalDto) {
        SupplierProposal existingProposal = supplierProposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        
        // Проверяем, что предложение можно редактировать
        if (existingProposal.getStatus() != SupplierProposal.ProposalStatus.DRAFT) {
            throw new RuntimeException("Можно редактировать только черновик предложения");
        }
        
        // Обновляем только разрешенные поля
        existingProposal.setCoverLetter(proposalDto.getCoverLetter());
        existingProposal.setTechnicalProposal(proposalDto.getTechnicalProposal());
        existingProposal.setCommercialTerms(proposalDto.getCommercialTerms());
        existingProposal.setPaymentTerms(proposalDto.getPaymentTerms());
        existingProposal.setDeliveryTerms(proposalDto.getDeliveryTerms());
        existingProposal.setWarrantyTerms(proposalDto.getWarrantyTerms());
        existingProposal.setValidUntil(proposalDto.getValidUntil());
        
        SupplierProposal updatedProposal = supplierProposalRepository.save(existingProposal);
        return supplierProposalMapper.toDto(updatedProposal);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierProposalDto getProposalById(UUID id) {
        SupplierProposal proposal = supplierProposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        return supplierProposalMapper.toDto(proposal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierProposalDto> getProposalsByTender(UUID tenderId) {
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        return proposals.stream()
                .map(supplierProposalMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierProposalDto> getProposalsBySupplier(UUID supplierId) {
        List<SupplierProposal> proposals = supplierProposalRepository.findBySupplierId(supplierId);
        return proposals.stream()
                .map(supplierProposalMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierProposalDto> getProposalsByStatus(SupplierProposal.ProposalStatus status) {
        List<SupplierProposal> proposals = supplierProposalRepository.findByStatus(status);
        return proposals.stream()
                .map(supplierProposalMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProposal(UUID id) {
        SupplierProposal proposal = supplierProposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        
        // Проверяем, что предложение можно удалить
        if (proposal.getStatus() != SupplierProposal.ProposalStatus.DRAFT) {
            throw new RuntimeException("Можно удалить только черновик предложения");
        }
        
        supplierProposalRepository.delete(proposal);
    }

    @Override
    public SupplierProposalDto submitProposal(UUID id) {
        SupplierProposal proposal = supplierProposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        
        if (proposal.getStatus() != SupplierProposal.ProposalStatus.DRAFT) {
            throw new RuntimeException("Можно подать только черновик предложения");
        }
        
        // Проверяем, что тендер принимает предложения
        Tender tender = proposal.getTender();
        if (tender.getStatus() != Tender.TenderStatus.BIDDING) {
            throw new RuntimeException("Тендер не принимает предложения");
        }
        
        proposal.setStatus(SupplierProposal.ProposalStatus.SUBMITTED);
        proposal.setSubmissionDate(LocalDateTime.now());
        
        SupplierProposal savedProposal = supplierProposalRepository.save(proposal);
        return supplierProposalMapper.toDto(savedProposal);
    }

    @Override
    public SupplierProposalDto acceptProposal(UUID id) {
        SupplierProposal proposal = supplierProposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        
        if (proposal.getStatus() != SupplierProposal.ProposalStatus.SUBMITTED) {
            throw new RuntimeException("Можно принять только поданное предложение");
        }
        
        proposal.setStatus(SupplierProposal.ProposalStatus.ACCEPTED);
        
        SupplierProposal savedProposal = supplierProposalRepository.save(proposal);
        return supplierProposalMapper.toDto(savedProposal);
    }

    @Override
    public SupplierProposalDto rejectProposal(UUID id) {
        SupplierProposal proposal = supplierProposalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        
        if (proposal.getStatus() != SupplierProposal.ProposalStatus.SUBMITTED) {
            throw new RuntimeException("Можно отклонить только поданное предложение");
        }
        
        proposal.setStatus(SupplierProposal.ProposalStatus.REJECTED);
        
        SupplierProposal savedProposal = supplierProposalRepository.save(proposal);
        return supplierProposalMapper.toDto(savedProposal);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierProposalDto getBestProposalForTender(UUID tenderId) {
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        // Фильтруем только поданные предложения
        List<SupplierProposal> submittedProposals = proposals.stream()
                .filter(p -> p.getStatus() == SupplierProposal.ProposalStatus.SUBMITTED)
                .collect(Collectors.toList());
        
        // Находим предложение с минимальной ценой
        SupplierProposal bestProposal = submittedProposals.stream()
                .filter(p -> p.getTotalPrice() != null)
                .min((p1, p2) -> Double.compare(p1.getTotalPrice(), p2.getTotalPrice()))
                .orElse(null);
        
        return bestProposal != null ? supplierProposalMapper.toDto(bestProposal) : null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProposalItemDto> getProposalItems(UUID proposalId) {
        List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(proposalId);
        return items.stream()
                .map(proposalItemMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierProposalDto getProposalWithBestOffers(UUID proposalId) {
        SupplierProposal proposal = supplierProposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        
        SupplierProposalDto proposalDto = supplierProposalMapper.toDto(proposal);
        
        // Получаем позиции предложения
        List<ProposalItemDto> items = getProposalItems(proposalId);
        proposalDto.setProposalItems(items);
        
        // Рассчитываем общую цену
        double totalPrice = items.stream()
                .filter(item -> item.getTotalPrice() != null)
                .mapToDouble(ProposalItemDto::getTotalPrice)
                .sum();
        
        proposalDto.setTotalPrice(totalPrice);
        
        return proposalDto;
    }

    private void createProposalItemsFromTender(SupplierProposal proposal, Tender tender) {
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tender.getId());
        
        for (int i = 0; i < tenderItems.size(); i++) {
            TenderItem tenderItem = tenderItems.get(i);
            
            ProposalItem proposalItem = new ProposalItem();
            proposalItem.setSupplierProposal(proposal);
            proposalItem.setTenderItem(tenderItem);
            proposalItem.setItemNumber(i + 1);
            proposalItem.setDescription(tenderItem.getDescription());
            proposalItem.setQuantity(tenderItem.getQuantity());
            proposalItem.setUnit(tenderItem.getUnit());
            proposalItem.setSpecifications(tenderItem.getSpecifications());
            
            proposalItemRepository.save(proposalItem);
        }
    }
} 