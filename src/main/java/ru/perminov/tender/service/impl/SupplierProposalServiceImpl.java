package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import ru.perminov.tender.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierProposalServiceImpl implements SupplierProposalService {

    private static final Logger log = LoggerFactory.getLogger(SupplierProposalServiceImpl.class);
    private final SupplierProposalRepository supplierProposalRepository;
    private final ProposalItemRepository proposalItemRepository;
    private final TenderRepository tenderRepository;
    private final TenderItemRepository tenderItemRepository;
    private final CompanyRepository companyRepository;
    private final NotificationService notificationService;
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

        // Устанавливаем тендер по tenderId из DTO
        if (proposalDto.getTenderId() != null) {
            Tender tender = tenderRepository.findById(proposalDto.getTenderId())
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
            proposal.setTender(tender);
        }
        
        // Проверка: supplierId обязателен
        if (proposalDto.getSupplierId() == null) {
            throw new RuntimeException("Поставщик обязателен для заполнения");
        }
        
        // Устанавливаем поставщика по supplierId из DTO
        Company supplier = companyRepository.findById(proposalDto.getSupplierId())
            .orElseThrow(() -> new RuntimeException("Поставщик не найден"));
        proposal.setSupplier(supplier);
        
        SupplierProposal savedProposal = supplierProposalRepository.save(proposal);
        
        // Сохраняем позиции из DTO
        if (proposalDto.getProposalItems() != null) {
            for (ProposalItemDto itemDto : proposalDto.getProposalItems()) {
                 // Валидация цен и количества
                if (itemDto.getQuantity() != null && itemDto.getQuantity() <= 0) {
                    throw new RuntimeException("Количество должно быть больше 0");
                }
                if (itemDto.getUnitPrice() != null && itemDto.getUnitPrice() <= 0) {
                    throw new RuntimeException("Цена за единицу должна быть больше 0");
                }
                if (itemDto.getTotalPrice() != null && itemDto.getTotalPrice() <= 0) {
                    throw new RuntimeException("Общая стоимость должна быть больше 0");
                }
                
                ProposalItem item = proposalItemMapper.toEntity(itemDto);
                item.setSupplierProposal(savedProposal);
                // Логируем tenderItemId
                log.info("Сохраняем позицию предложения: description={}, tenderItemId={}", item.getDescription(), itemDto.getTenderItemId());
                // Устанавливаем связь с TenderItem по tenderItemId
                if (itemDto.getTenderItemId() != null) {
                    TenderItem tenderItem = tenderItemRepository.findById(itemDto.getTenderItemId())
                        .orElseThrow(() -> new RuntimeException("Позиция тендера не найдена: " + itemDto.getTenderItemId()));
                    item.setTenderItem(tenderItem);
                }
                if (itemDto.getTenderItemId() != null) {
                    boolean exists = proposalItemRepository.existsBySupplierProposalIdAndTenderItemId(savedProposal.getId(), itemDto.getTenderItemId());
                    if (exists) {
                        throw new RuntimeException("Вы уже подали предложение на эту позицию");
                    }
                }
                proposalItemRepository.save(item);
            }
        }
        
        // Рассчитать и сохранить totalPrice
        List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(savedProposal.getId());
        double total = items.stream().filter(i -> i.getTotalPrice() != null).mapToDouble(ProposalItem::getTotalPrice).sum();
        savedProposal.setTotalPrice(total);
        supplierProposalRepository.save(savedProposal);
        
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
        
        // Проверяем, что тендер установлен
        Tender tender = proposal.getTender();
        if (tender == null) {
            throw new RuntimeException("У предложения не указан тендер");
        }
        if (tender.getStatus() != Tender.TenderStatus.BIDDING) {
            throw new RuntimeException("Тендер не принимает предложения");
        }
        
        proposal.setStatus(SupplierProposal.ProposalStatus.SUBMITTED);
        proposal.setSubmissionDate(LocalDateTime.now());
        
        SupplierProposal savedProposal = supplierProposalRepository.save(proposal);
        
        // Пересчитать и сохранить totalPrice
        List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(savedProposal.getId());
        double total = items.stream().filter(i -> i.getTotalPrice() != null).mapToDouble(ProposalItem::getTotalPrice).sum();
        savedProposal.setTotalPrice(total);
        supplierProposalRepository.save(savedProposal);
        
        // Отправляем уведомление о получении предложения
        try {
            notificationService.notifyProposalSubmitted(savedProposal);
        } catch (Exception e) {
            log.error("Ошибка отправки уведомления о получении предложения: {}", savedProposal.getId(), e);
        }
        
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
        List<SupplierProposal> submittedProposals = proposals.stream()
                .filter(p -> p.getStatus() == SupplierProposal.ProposalStatus.SUBMITTED)
                .collect(Collectors.toList());
        
        // Получаем все позиции тендера
        List<TenderItem> tenderItems = tenderItemRepository.findByTenderId(tenderId);
        Set<UUID> tenderItemIds = tenderItems.stream().map(TenderItem::getId).collect(Collectors.toSet());

        // Получаем лучшие цены по каждой позиции
        Map<UUID, Double> bestPrices = getBestPricesByTenderItems(tenderId);

        // Фильтруем предложения, которые покрывают все позиции тендера (без дубликатов)
        List<SupplierProposal> fullProposals = submittedProposals.stream()
                .filter(p -> {
                    List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(p.getId());
                    Set<UUID> proposalTenderItemIds = items.stream()
                        .map(i -> i.getTenderItem().getId())
                        .collect(Collectors.toSet());
                    // Должны быть все позиции тендера, без дубликатов и пропусков
                    if (!proposalTenderItemIds.equals(tenderItemIds)) return false;
                    // По каждой позиции — минимальная цена
                    for (ProposalItem item : items) {
                        Double best = bestPrices.get(item.getTenderItem().getId());
                        if (best == null || Math.abs(item.getUnitPrice() - best) > 0.01) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();

        // Среди таких предложений выбираем с минимальной общей ценой
        SupplierProposal bestProposal = fullProposals.stream()
                .filter(p -> p.getTotalPrice() != null)
                .min((p1, p2) -> Double.compare(p1.getTotalPrice(), p2.getTotalPrice()))
                .orElse(null);
        
        return bestProposal != null ? supplierProposalMapper.toDto(bestProposal) : null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProposalItemDto> getProposalItems(UUID proposalId) {
        List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(proposalId);
        List<ProposalItemDto> itemDtos = items.stream()
                .map(proposalItemMapper::toDto)
                .collect(Collectors.toList());
        
        // Получаем лучшие цены по позициям тендера
        SupplierProposal proposal = supplierProposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        
        if (proposal.getTender() != null) {
            Map<UUID, Double> bestPrices = getBestPricesByTenderItems(proposal.getTender().getId());
            
            // Устанавливаем флаг isBestPrice для каждой позиции
            for (ProposalItemDto itemDto : itemDtos) {
                if (itemDto.getTenderItemId() != null && itemDto.getUnitPrice() != null) {
                    Double bestPrice = bestPrices.get(itemDto.getTenderItemId());
                    if (bestPrice != null && Math.abs(itemDto.getUnitPrice() - bestPrice) < 0.01) {
                        itemDto.setIsBestPrice(true);
                    }
                }
            }
        }
        
        return itemDtos;
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierProposalDto getProposalWithBestOffers(UUID proposalId) {
        SupplierProposal proposal = supplierProposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Предложение не найдено"));
        
        SupplierProposalDto proposalDto = supplierProposalMapper.toDto(proposal);
        
        // Получаем позиции предложения с расчетом лучших цен
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

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, Double> getBestPricesByTenderItems(UUID tenderId) {
        // Получаем все поданные предложения для тендера
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        List<SupplierProposal> validProposals = proposals.stream()
                .filter(p -> p.getStatus() != SupplierProposal.ProposalStatus.REJECTED)
                .collect(Collectors.toList());

        Map<UUID, Double> bestPrices = new HashMap<>();
        
        // Для каждого предложения получаем позиции и находим лучшие цены
        for (SupplierProposal proposal : validProposals) {
            List<ProposalItem> items = proposalItemRepository.findBySupplierProposalId(proposal.getId());
            
            for (ProposalItem item : items) {
                if (item.getTenderItem() != null && item.getUnitPrice() != null) {
                    UUID tenderItemId = item.getTenderItem().getId();
                    Double currentBestPrice = bestPrices.get(tenderItemId);
                    
                    if (currentBestPrice == null || item.getUnitPrice() < currentBestPrice) {
                        bestPrices.put(tenderItemId, item.getUnitPrice());
                    }
                }
            }
        }
        
        return bestPrices;
    }

    @Override
    public List<SupplierProposalDto> getAllProposals() {
        List<SupplierProposal> proposals = supplierProposalRepository.findAll();
        return proposals.stream().map(supplierProposalMapper::toDto).collect(Collectors.toList());
    }

    @Override
    public void acceptAllProposalsForTender(UUID tenderId) {
        log.info("Обновление статуса всех предложений тендера {} на ACCEPTED (кроме отклоненных)", tenderId);
        
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderId(tenderId);
        
        for (SupplierProposal proposal : proposals) {
            // Обновляем статус только для предложений, которые не отклонены
            if (proposal.getStatus() != SupplierProposal.ProposalStatus.REJECTED) {
                proposal.setStatus(SupplierProposal.ProposalStatus.ACCEPTED);
                supplierProposalRepository.save(proposal);
                log.info("Обновлен статус предложения {} на ACCEPTED", proposal.getId());
            }
        }
        
        log.info("Завершено обновление статуса предложений для тендера {}", tenderId);
    }
} 