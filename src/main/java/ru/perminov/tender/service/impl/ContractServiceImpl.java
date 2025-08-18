package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.dto.contract.ContractDtoNew;
import ru.perminov.tender.dto.contract.ContractDtoUpdate;
import ru.perminov.tender.dto.contract.ContractItemDto;
import ru.perminov.tender.dto.contract.ContractFromWinnersDto;
import ru.perminov.tender.mapper.ContractMapper;
import ru.perminov.tender.mapper.company.CompanyMapper;
import ru.perminov.tender.model.Contract;
import ru.perminov.tender.model.ContractItem;
import ru.perminov.tender.model.Tender;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.model.TenderItem;
import ru.perminov.tender.model.ProposalItem;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.ContractItemRepository;
import ru.perminov.tender.repository.ContractRepository;
import ru.perminov.tender.repository.TenderRepository;
import ru.perminov.tender.repository.SupplierProposalRepository;
import ru.perminov.tender.repository.TenderItemRepository;
import ru.perminov.tender.repository.ProposalItemRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.ContractService;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.dto.tender.TenderDto;
import ru.perminov.tender.mapper.TenderMapper;
import ru.perminov.tender.service.AuditLogService;
import ru.perminov.tender.service.TenderWinnerService;
import ru.perminov.tender.service.InvoiceService;
import ru.perminov.tender.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import ru.perminov.tender.model.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContractServiceImpl implements ContractService {
    private final ContractRepository contractRepository;
    private final ContractItemRepository contractItemRepository;
    private final TenderRepository tenderRepository;
    private final SupplierProposalRepository supplierProposalRepository;
    private final TenderItemRepository tenderItemRepository;
    private final ProposalItemRepository proposalItemRepository;
    private final CompanyRepository companyRepository;
    private final ContractMapper contractMapper;
    private final CompanyMapper companyMapper;
    private final TenderMapper tenderMapper;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final TenderWinnerService tenderWinnerService;
    private final ru.perminov.tender.repository.InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public ContractDto getContractById(UUID id) {
        Contract contract = contractRepository.findById(id)
                .orElse(null);
        if (contract == null) {
            return null;
        }
        
        ContractDto dto = contractMapper.toDto(contract);
        
        // Заполняем тендер с заказчиком и поставщиком
        if (contract.getTender() != null) {
            TenderDto tenderDto = tenderMapper.toDto(contract.getTender());
            
            // Заполняем awardedSupplier если есть awardedSupplierId
            if (contract.getTender().getAwardedSupplierId() != null) {
                Company awardedSupplier = companyRepository.findById(contract.getTender().getAwardedSupplierId()).orElse(null);
                if (awardedSupplier != null) {
                    tenderDto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
                }
            }
            
            dto.setTender(tenderDto);
            
            // Заполняем warehouse из тендера
            if (contract.getTender().getWarehouse() != null) {
                dto.setWarehouseId(contract.getTender().getWarehouse().getId());
                dto.setWarehouseName(contract.getTender().getWarehouse().getName());
            }
        }
        
        // Вручную заполняем позиции контракта
        List<ContractItemDto> items = getContractItems(id);
        dto.setContractItems(items);
        
        return dto;
    }

    @Override
    public List<ContractDto> getAllContracts() {
        List<Contract> contracts = contractRepository.findAll();
        return contracts.stream()
                .map(contract -> {
                    ContractDto dto = contractMapper.toDto(contract);
                    
                    // Заполняем тендер с заказчиком и поставщиком
                    if (contract.getTender() != null) {
                        TenderDto tenderDto = tenderMapper.toDto(contract.getTender());
                        
                        // Заполняем awardedSupplier если есть awardedSupplierId
                        if (contract.getTender().getAwardedSupplierId() != null) {
                            Company awardedSupplier = companyRepository.findById(contract.getTender().getAwardedSupplierId()).orElse(null);
                            if (awardedSupplier != null) {
                                tenderDto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
                            }
                        }
                        
                        dto.setTender(tenderDto);
                        
                        // Заполняем warehouse из тендера
                        if (contract.getTender().getWarehouse() != null) {
                            dto.setWarehouseId(contract.getTender().getWarehouse().getId());
                            dto.setWarehouseName(contract.getTender().getWarehouse().getName());
                        }
                    }
                    
                    // Вручную заполняем позиции контракта
                    List<ContractItemDto> items = getContractItems(contract.getId());
                    dto.setContractItems(items);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ContractDto> getContractsByStatus(String status) {
        try {
            Contract.ContractStatus contractStatus = Contract.ContractStatus.valueOf(status.toUpperCase());
            List<Contract> contracts = contractRepository.findByStatus(contractStatus);
            return contracts.stream()
                    .map(contract -> {
                        ContractDto dto = contractMapper.toDto(contract);
                        
                        // Заполняем тендер с заказчиком и поставщиком
                        if (contract.getTender() != null) {
                            TenderDto tenderDto = tenderMapper.toDto(contract.getTender());
                            
                            // Заполняем awardedSupplier если есть awardedSupplierId
                            if (contract.getTender().getAwardedSupplierId() != null) {
                                Company awardedSupplier = companyRepository.findById(contract.getTender().getAwardedSupplierId()).orElse(null);
                                if (awardedSupplier != null) {
                                    tenderDto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
                                }
                            }
                            
                            dto.setTender(tenderDto);
                            
                            // Заполняем warehouse из тендера
                            if (contract.getTender().getWarehouse() != null) {
                                dto.setWarehouseId(contract.getTender().getWarehouse().getId());
                                dto.setWarehouseName(contract.getTender().getWarehouse().getName());
                            }
                        }
                        
                        // Вручную заполняем позиции контракта
                        List<ContractItemDto> items = getContractItems(contract.getId());
                        dto.setContractItems(items);
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @Override
    public List<ContractDto> getContractsBySupplier(UUID supplierId) {
        // Этот метод теперь должен фильтровать по contract.getTender().getAwardedSupplierId()
        List<Contract> contracts = contractRepository.findAll();
        return contracts.stream()
                .filter(contract -> supplierId.equals(contract.getTender().getAwardedSupplierId()))
                .map(contract -> {
                    ContractDto dto = contractMapper.toDto(contract);
                    
                    // Заполняем тендер с заказчиком и поставщиком
                    if (contract.getTender() != null) {
                        TenderDto tenderDto = tenderMapper.toDto(contract.getTender());
                        
                        // Заполняем awardedSupplier если есть awardedSupplierId
                        if (contract.getTender().getAwardedSupplierId() != null) {
                            Company awardedSupplier = companyRepository.findById(contract.getTender().getAwardedSupplierId()).orElse(null);
                            if (awardedSupplier != null) {
                                tenderDto.setAwardedSupplier(companyMapper.toCompanyDto(awardedSupplier));
                            }
                        }
                        
                        dto.setTender(tenderDto);
                        
                        // Заполняем warehouse из тендера
                        if (contract.getTender().getWarehouse() != null) {
                            dto.setWarehouseId(contract.getTender().getWarehouse().getId());
                            dto.setWarehouseName(contract.getTender().getWarehouse().getName());
                        }
                    }
                    
                    // Вручную заполняем позиции контракта
                    List<ContractItemDto> items = getContractItems(contract.getId());
                    dto.setContractItems(items);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ContractDto updateContract(UUID id, ContractDtoUpdate contractDtoUpdate) {
        Optional<Contract> contractOpt = contractRepository.findById(id);
        if (contractOpt.isEmpty()) return null;
        Contract contract = contractOpt.get();
        contractMapper.updateEntity(contract, contractDtoUpdate);
        Contract updatedContract = contractRepository.save(contract);
        auditLogService.logSimple(getCurrentUser(), "UPDATE_CONTRACT", "Contract", updatedContract.getId().toString(), "Обновлен контракт");
        return contractMapper.toDto(updatedContract);
    }

    @Override
    public void deleteContract(UUID id) {
        contractRepository.deleteById(id);
        auditLogService.logSimple(getCurrentUser(), "DELETE_CONTRACT", "Contract", id.toString(), "Удален контракт");
    }

    @Override
    public ContractDto changeContractStatus(UUID id, String newStatus) {
        Optional<Contract> contractOpt = contractRepository.findById(id);
        if (contractOpt.isEmpty()) return null;
        Contract contract = contractOpt.get();
        try {
            Contract.ContractStatus status = Contract.ContractStatus.valueOf(newStatus.toUpperCase());
            contract.setStatus(status);
            return contractMapper.toDto(contractRepository.save(contract));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Override
    public List<ContractItemDto> getContractItems(UUID contractId) {
        List<ContractItem> items = contractItemRepository.findByContractIdWithUnitsAndMaterials(contractId);
        return items.stream().map(item -> {
            ContractItemDto dto = new ContractItemDto();
            dto.setId(item.getId());
            dto.setContractId(contractId);
            dto.setMaterialId(item.getMaterial() != null ? item.getMaterial().getId() : null);
            dto.setMaterialName(item.getMaterial() != null ? item.getMaterial().getName() : "");
            dto.setQuantity(item.getQuantity());
            dto.setUnitId(item.getUnit() != null ? item.getUnit().getId() : null);
            dto.setUnitName(item.getUnit() != null ? item.getUnit().getName() : "");
            dto.setUnitPrice(item.getUnitPrice());
            dto.setTotalPrice(item.getTotalPrice());
            dto.setDescription(item.getDescription());
            
            // Логируем информацию о единицах измерения
            log.info("ContractItem {}: unitId={}, unitName={}", 
                    item.getId(), 
                    dto.getUnitId(), 
                    dto.getUnitName());
            
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public ContractDto createContractFromTender(ContractDtoNew contractDtoNew ) {
        log.info("Создание контракта на основе тендера {} и поставщика {}", contractDtoNew.tenderId(), contractDtoNew.supplierId());
        
        // Получаем тендер с заказчиком
        Tender tender = tenderRepository.findByIdWithCustomer(contractDtoNew.tenderId())
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        Company customer = tender.getCustomer();
        log.info("Tender customer: {}", customer != null ? customer.getName() : "null");
        
        log.info("Найден тендер: {} - {}", tender.getTenderNumber(), tender.getTitle());
        
        // Разрешаем создание контракта в статусах AWARDED и EVALUATION (оценка)
        if (tender.getStatus() != Tender.TenderStatus.AWARDED
                && tender.getStatus() != Tender.TenderStatus.EVALUATION) {
            log.warn("Попытка создания контракта для тендера со статусом {} (требуется AWARDED или EVALUATION)", tender.getStatus());
            throw new RuntimeException("Контракт можно создать только для тендера в статусе 'Присужден' или 'Оценка'");
        }
        
        // Получаем предложение поставщика
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderIdAndSupplierId(contractDtoNew.tenderId(), contractDtoNew.supplierId());
        log.info("Найдено {} предложений поставщика для тендера {}", proposals.size(), contractDtoNew.tenderId());
        
        SupplierProposal proposal = proposals.stream()
                .filter(p -> p.getStatus() == SupplierProposal.ProposalStatus.ACCEPTED)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Принятое предложение поставщика не найдено"));
        
        log.info("Найдено принятое предложение: {} от поставщика {}", proposal.getProposalNumber(), contractDtoNew.supplierId());
        
        // Получаем поставщика
        Company supplier = companyRepository.findById(contractDtoNew.supplierId())
                .orElseThrow(() -> new RuntimeException("Поставщик не найден"));
        
        log.info("Найден поставщик: {} - {}", supplier.getName(), supplier.getId());
        
        // Получаем заказчика
        if (customer == null) {
            throw new RuntimeException("У тендера не найден заказчик");
        }
        // Создаем контракт
        Contract contract = new Contract();
        contract.setTender(tender);
        contract.setSupplierProposal(proposal);
        contract.setContractNumber("CON-" + System.currentTimeMillis());
        contract.setTitle("Контракт по тендеру " + tender.getTenderNumber());
        contract.setContractDate(LocalDate.now());
        contract.setStartDate(contractDtoNew.startDate());
        contract.setEndDate(contractDtoNew.endDate());
        contract.setStatus(Contract.ContractStatus.DRAFT);
        // Итоговую сумму рассчитаем после формирования позиций только по выигравшим позициям
        contract.setTotalAmount(BigDecimal.ZERO);
        contract.setCurrency(proposal.getCurrency());
        
        // Устанавливаем условия из тендера и предложения
        contract.setPaymentTerms(proposal.getPaymentTerms());
        contract.setDeliveryTerms(proposal.getDeliveryTerms());
        contract.setWarrantyTerms(proposal.getWarrantyTerms());
        
        // Устанавливаем описание и условия из тендера
        contract.setDescription(tender.getDescription());
        contract.setTerms(tender.getTermsAndConditions());
        contract.setSpecialConditions(tender.getRequirements());
        
        contract.setCreatedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());
        
        Contract savedContract = contractRepository.save(contract);
        auditLogService.logSimple(getCurrentUser(), "CREATE_CONTRACT", "Contract", savedContract.getId().toString(), "Создан контракт");
        log.info("Контракт сохранен с ID: {}", savedContract.getId());
        
        // Создаем позиции контракта ТОЛЬКО по тем тендерным позициям, где этот поставщик победил
        List<ProposalItem> proposalItems = proposalItemRepository.findBySupplierProposalId(proposal.getId())
                .stream()
                .filter(pi -> {
                    TenderItem ti = pi.getTenderItem();
                    return ti != null && ti.getAwardedSupplierId() != null && ti.getAwardedSupplierId().equals(contractDtoNew.supplierId());
                })
                .collect(java.util.stream.Collectors.toList());
        log.info("Найдено {} позиций в предложении поставщика", proposalItems.size());
        
        int createdItemsCount = 0;
        BigDecimal contractTotal = BigDecimal.ZERO;
        for (ProposalItem proposalItem : proposalItems) {
            ContractItem contractItem = new ContractItem();
            contractItem.setContract(savedContract);
            contractItem.setTenderItem(proposalItem.getTenderItem());
            
            // Получаем материал через RequestMaterial
            Material material = null;
            if (proposalItem.getTenderItem() != null && 
                proposalItem.getTenderItem().getRequestMaterial() != null) {
                material = proposalItem.getTenderItem().getRequestMaterial().getMaterial();
            }
            contractItem.setMaterial(material);
            
            contractItem.setItemNumber(proposalItem.getItemNumber());
            contractItem.setDescription(proposalItem.getDescription());
            contractItem.setQuantity(BigDecimal.valueOf(proposalItem.getQuantity()));
            
            // Приоритет единицы измерения: сначала из предложения, потом из тендерной позиции
            if (proposalItem.getUnit() != null) {
                contractItem.setUnit(proposalItem.getUnit());
            } else if (proposalItem.getTenderItem() != null && proposalItem.getTenderItem().getUnit() != null) {
                contractItem.setUnit(proposalItem.getTenderItem().getUnit());
                log.info("Скопирована единица измерения из тендерной позиции: {} для позиции контракта {}", 
                        proposalItem.getTenderItem().getUnit().getName(), proposalItem.getDescription());
            }
            
            contractItem.setUnitPrice(BigDecimal.valueOf(proposalItem.getUnitPrice()));
            contractItem.setTotalPrice(BigDecimal.valueOf(proposalItem.getTotalPrice()));
            contractItem.setSpecifications(proposalItem.getSpecifications());
            contractItem.setDeliveryPeriod(proposalItem.getDeliveryPeriod());
            contractItem.setWarranty(proposalItem.getWarranty() != null ? proposalItem.getWarranty().getName() : null);
            contractItem.setAdditionalInfo(proposalItem.getAdditionalInfo());
            
            contractItemRepository.save(contractItem);
            createdItemsCount++;
            contractTotal = contractTotal.add(contractItem.getTotalPrice() != null ? contractItem.getTotalPrice() : BigDecimal.ZERO);
            
            log.debug("Создана позиция контракта: {} - {} (количество: {}, цена: {})", 
                     proposalItem.getItemNumber(), proposalItem.getDescription(), 
                     proposalItem.getQuantity(), proposalItem.getUnitPrice());
        }
        
        // Если не было ни одной выигравшей позиции — удаляем пустой контракт и тихо возвращаем null
        if (createdItemsCount == 0) {
            log.warn("Для поставщика {} нет выигравших позиций в тендере {}. Контракт не создаем.", supplier.getId(), tender.getId());
            contractRepository.delete(savedContract);
            return null;
        }

        // Обновляем итоговую сумму контракта суммой по выигравшим позициям
        savedContract.setTotalAmount(contractTotal);
        contractRepository.save(savedContract);

        log.info("Контракт создан успешно: {} с {} позициями. Итого: {}", savedContract.getId(), createdItemsCount, contractTotal);
        
        // Возвращаем контракт с позициями
        return getContractById(savedContract.getId());
    }

    @Override
    public List<ContractDto> createContractsFromAllWinners(ru.perminov.tender.dto.contract.ContractsFromAllWinnersDto dto) {
        log.info("Создание контрактов для всех победителей тендера: {}", dto.tenderId());
        Tender tender = tenderRepository.findByIdWithCustomer(dto.tenderId())
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));

        // Получаем победителей по позициям c учетом ручного выбора
        var winnersDto = tenderWinnerService.determineWinners(dto.tenderId());

        // Группируем позиции по поставщику-победителю
        Map<UUID, java.util.List<java.util.UUID>> itemIdsBySupplier = new java.util.HashMap<>();
        for (var iw : winnersDto.itemWinners()) {
            if (iw.winner() != null && iw.winner().supplierId() != null) {
                itemIdsBySupplier.computeIfAbsent(iw.winner().supplierId(), k -> new java.util.ArrayList<>())
                        .add(iw.tenderItemId());
            }
        }

        java.util.List<ContractDto> result = new java.util.ArrayList<>();
        for (Map.Entry<UUID, java.util.List<java.util.UUID>> entry : itemIdsBySupplier.entrySet()) {
            UUID supplierId = entry.getKey();
            java.util.List<java.util.UUID> tenderItemIds = entry.getValue();

            // Берем все предложения этого поставщика в тендере
            List<SupplierProposal> proposals = supplierProposalRepository.findByTenderIdAndSupplierId(dto.tenderId(), supplierId);
            SupplierProposal anyProposal = proposals.stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Не найдено предложение поставщика для контракта"));

            // Ищем уже существующий контракт по tender+supplier
            Contract saved = contractRepository.findExistingByTenderAndSupplier(dto.tenderId(), supplierId)
                    .orElseGet(() -> {
                        Contract c = new Contract();
                        c.setTender(tender);
                        c.setSupplierProposal(anyProposal);
                        c.setContractNumber("CON-" + System.currentTimeMillis());
                        c.setTitle(dto.title() != null ? dto.title() : ("Контракт по тендеру " + tender.getTenderNumber()));
                        java.time.LocalDate today = java.time.LocalDate.now();
                        c.setContractDate(today);
                        java.time.LocalDate start = dto.startDate() != null ? dto.startDate() : today;
                        java.time.LocalDate end = dto.endDate() != null ? dto.endDate() : start.plusYears(1);
                        c.setStartDate(start);
                        c.setEndDate(end);
                        c.setStatus(Contract.ContractStatus.DRAFT);
                        c.setTotalAmount(java.math.BigDecimal.ZERO);
                        c.setCurrency(anyProposal.getCurrency());
                        c.setDescription(dto.description());
                        c.setCreatedAt(java.time.LocalDateTime.now());
                        c.setUpdatedAt(java.time.LocalDateTime.now());
                        return contractRepository.save(c);
                    });
            // Если контракт уже существовал и даты не заданы — задаем дефолты/переданные
            if (saved.getStartDate() == null || saved.getEndDate() == null) {
                java.time.LocalDate today = java.time.LocalDate.now();
                java.time.LocalDate start = dto.startDate() != null ? dto.startDate() : (saved.getStartDate() != null ? saved.getStartDate() : today);
                java.time.LocalDate end = dto.endDate() != null ? dto.endDate() : (saved.getEndDate() != null ? saved.getEndDate() : start.plusYears(1));
                saved.setStartDate(start);
                saved.setEndDate(end);
                saved = contractRepository.save(saved);
            }
            auditLogService.logSimple(getCurrentUser(), "CREATE_CONTRACT", "Contract", saved.getId().toString(), "Создан контракт из всех победителей");

            java.math.BigDecimal total = java.math.BigDecimal.ZERO;

            // Для каждого ID позиции подбираем строку ИЗ ВЫИГРЫШНОГО предложения этого поставщика
            for (java.util.UUID itemId : tenderItemIds) {
                // Находим ровно ту строку предложения победителя для этой позиции
                ProposalItem found = proposalItemRepository.findByTenderItemIdAndSupplierId(itemId, supplierId).orElse(null);
                if (found == null) continue;

                TenderItem ti = found.getTenderItem();
                ContractItem ci = new ContractItem();
                ci.setContract(saved);
                ci.setTenderItem(ti);
                if (ti != null && ti.getRequestMaterial() != null) {
                    ci.setMaterial(ti.getRequestMaterial().getMaterial());
                }
                ci.setItemNumber(found.getItemNumber());
                ci.setDescription(found.getDescription());
                ci.setQuantity(java.math.BigDecimal.valueOf(found.getQuantity() != null ? found.getQuantity() : (ti != null && ti.getQuantity() != null ? ti.getQuantity() : 0.0)));
                if (found.getUnit() != null) {
                    ci.setUnit(found.getUnit());
                } else if (ti != null && ti.getUnit() != null) {
                    ci.setUnit(ti.getUnit());
                }
                if (found.getUnitPrice() != null) ci.setUnitPrice(java.math.BigDecimal.valueOf(found.getUnitPrice()));
                if (found.getTotalPrice() != null) ci.setTotalPrice(java.math.BigDecimal.valueOf(found.getTotalPrice()));
                ci.setSpecifications(found.getSpecifications());
                ci.setDeliveryPeriod(found.getDeliveryPeriod());
                ci.setWarranty(found.getWarranty() != null ? found.getWarranty().getName() : null);
                ci.setAdditionalInfo(found.getAdditionalInfo());

                // Защита от дубликатов одной позиции
                boolean exists = contractItemRepository.findByContractId(saved.getId()).stream()
                        .anyMatch(x -> x.getTenderItem() != null && x.getTenderItem().getId().equals(itemId));
                if (!exists) {
                    contractItemRepository.save(ci);
                    if (ci.getTotalPrice() != null) total = total.add(ci.getTotalPrice());
                }
            }

            saved.setTotalAmount(total);
            saved = contractRepository.save(saved);
            // Переводим тендер в статус AWARDED (Присужден), если еще не переведен
            try {
                Tender t = tenderRepository.findById(dto.tenderId()).orElse(null);
                if (t != null && t.getStatus() != Tender.TenderStatus.AWARDED) {
                    t.setStatus(Tender.TenderStatus.AWARDED);
                    tenderRepository.save(t);
                    auditLogService.logSimple(getCurrentUser(), "TENDER_AWARDED", "Tender", t.getId().toString(), "Тендер присужден (созданы контракты)");
                }
            } catch (Exception ex) {
                log.warn("Не удалось обновить статус тендера на AWARDED: {}", ex.getMessage());
            }
            result.add(contractMapper.toDto(saved));

            // Создаем черновой счет на основе выигрышных позиций предложения
            try {
                ru.perminov.tender.dto.InvoiceDtoNew invoiceNew = new ru.perminov.tender.dto.InvoiceDtoNew();
                invoiceNew.setContractId(saved.getId());
                invoiceNew.setSupplierId(supplierId);
                invoiceNew.setInvoiceNumber("INV-" + System.currentTimeMillis());
                invoiceNew.setInvoiceDate(java.time.LocalDate.now());
                invoiceNew.setDueDate(java.time.LocalDate.now().plusDays(14));
                invoiceNew.setCurrency(saved.getCurrency());
                invoiceNew.setPaymentTerms("Оплата по контракту");

                java.util.List<ru.perminov.tender.dto.InvoiceItemDtoNew> items = new java.util.ArrayList<>();
                for (ContractItem ci : contractItemRepository.findByContractId(saved.getId())) {
                    ru.perminov.tender.dto.InvoiceItemDtoNew ii = new ru.perminov.tender.dto.InvoiceItemDtoNew();
                    if (ci.getMaterial() != null) ii.setMaterialId(ci.getMaterial().getId());
                    ii.setDescription(ci.getDescription());
                    if (ci.getUnit() != null) ii.setUnitId(ci.getUnit().getId());
                    ii.setQuantity(ci.getQuantity());
                    // Цена: если в выигрышной строке предложения есть цена с НДС — берем её, иначе базовую
                    java.util.Optional<ProposalItem> optPi = proposalItemRepository.findByTenderItemIdAndSupplierId(
                            ci.getTenderItem() != null ? ci.getTenderItem().getId() : null,
                            supplierId
                    );
                    if (optPi.isPresent() && optPi.get().getUnitPriceWithVat() != null) {
                        ii.setUnitPrice(java.math.BigDecimal.valueOf(optPi.get().getUnitPriceWithVat()));
                        ii.setVatRate(java.math.BigDecimal.ZERO); // уже с НДС
                    } else {
                        ii.setUnitPrice(ci.getUnitPrice());
                        // Попробуем вычислить ставку НДС, если в предложении есть unitPriceWithVat
                        if (optPi.isPresent() && optPi.get().getUnitPriceWithVat() != null && ci.getUnitPrice() != null && ci.getUnitPrice().doubleValue() > 0) {
                            double base = ci.getUnitPrice().doubleValue();
                            double withVat = optPi.get().getUnitPriceWithVat();
                            double rate = (withVat / base - 1.0) * 100.0;
                            ii.setVatRate(java.math.BigDecimal.valueOf(rate));
                        }
                    }
                    items.add(ii);
                }
                invoiceNew.setInvoiceItems(items);

                java.math.BigDecimal invTotal = java.math.BigDecimal.ZERO;
                for (ContractItem ci : contractItemRepository.findByContractId(saved.getId())) {
                    if (ci.getTotalPrice() != null) invTotal = invTotal.add(ci.getTotalPrice());
                }
                invoiceNew.setTotalAmount(invTotal);

                invoiceService.createInvoice(invoiceNew);
            } catch (Exception e) {
                log.warn("Не удалось автоматически создать счет по контракту {}: {}", saved.getId(), e.getMessage());
            }
        }

        return result;
    }

    @Override
    public ContractDto createContractFromWinners(ContractFromWinnersDto contractFromWinnersDto) {
        log.info("Создание контракта из выбранных победителей для тендера: {}", contractFromWinnersDto.tenderId());
        
        // Получаем тендер
        Tender tender = tenderRepository.findById(contractFromWinnersDto.tenderId())
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        
        // Получаем заказчика
        Company customer = tender.getCustomer();
        if (customer == null) {
            throw new RuntimeException("У тендера не найден заказчик");
        }
        
        // Создаем контракт
        Contract contract = new Contract();
        contract.setTender(tender);
        contract.setContractNumber("CON-" + System.currentTimeMillis());
        contract.setTitle(contractFromWinnersDto.title());
        contract.setContractDate(LocalDate.now());
        contract.setStartDate(contractFromWinnersDto.startDate());
        contract.setEndDate(contractFromWinnersDto.endDate());
        contract.setStatus(Contract.ContractStatus.DRAFT);
        contract.setTotalAmount(BigDecimal.ZERO);
        contract.setCurrency("RUB");
        contract.setDescription(contractFromWinnersDto.description());
        contract.setTerms(tender.getTermsAndConditions());
        contract.setSpecialConditions(tender.getRequirements());
        contract.setCreatedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());
        
        Contract savedContract = contractRepository.save(contract);
        auditLogService.logSimple(getCurrentUser(), "CREATE_CONTRACT_FROM_WINNERS", "Contract", savedContract.getId().toString(), "Создан контракт из выбранных победителей");
        log.info("Контракт сохранен с ID: {}", savedContract.getId());
        
        // Создаем позиции контракта для выбранных победителей
        int createdItemsCount = 0;
        BigDecimal contractTotal = BigDecimal.ZERO;
        
        for (ContractFromWinnersDto.SelectedWinnerItemDto selectedItem : contractFromWinnersDto.selectedItems()) {
            // Получаем тендерную позицию
            TenderItem tenderItem = tenderItemRepository.findById(selectedItem.tenderItemId())
                    .orElseThrow(() -> new RuntimeException("Тендерная позиция не найдена: " + selectedItem.tenderItemId()));
            
            // Получаем предложение поставщика
            SupplierProposal supplierProposal = supplierProposalRepository.findByTenderIdAndSupplierId(
                    contractFromWinnersDto.tenderId(), selectedItem.supplierId())
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Предложение поставщика не найдено"));
            
            // Получаем позицию предложения
            ProposalItem proposalItem = proposalItemRepository.findBySupplierProposalId(supplierProposal.getId())
                    .stream()
                    .filter(pi -> pi.getTenderItem() != null && pi.getTenderItem().getId().equals(selectedItem.tenderItemId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Позиция предложения не найдена"));
            
            // Создаем позицию контракта
            ContractItem contractItem = new ContractItem();
            contractItem.setContract(savedContract);
            contractItem.setTenderItem(tenderItem);
            
            // Получаем материал через RequestMaterial
            Material material = null;
            if (tenderItem.getRequestMaterial() != null) {
                material = tenderItem.getRequestMaterial().getMaterial();
            }
            contractItem.setMaterial(material);
            
            contractItem.setItemNumber(proposalItem.getItemNumber());
            contractItem.setDescription(proposalItem.getDescription());
            contractItem.setQuantity(BigDecimal.valueOf(proposalItem.getQuantity()));
            
            // Приоритет единицы измерения: сначала из предложения, потом из тендерной позиции
            if (proposalItem.getUnit() != null) {
                contractItem.setUnit(proposalItem.getUnit());
            } else if (tenderItem.getUnit() != null) {
                contractItem.setUnit(tenderItem.getUnit());
            }
            
            contractItem.setUnitPrice(BigDecimal.valueOf(proposalItem.getUnitPrice()));
            contractItem.setTotalPrice(BigDecimal.valueOf(proposalItem.getTotalPrice()));
            contractItem.setSpecifications(proposalItem.getSpecifications());
            contractItem.setDeliveryPeriod(proposalItem.getDeliveryPeriod());
            contractItem.setWarranty(proposalItem.getWarranty() != null ? proposalItem.getWarranty().getName() : null);
            contractItem.setAdditionalInfo(proposalItem.getAdditionalInfo());
            
            contractItemRepository.save(contractItem);
            createdItemsCount++;
            contractTotal = contractTotal.add(contractItem.getTotalPrice() != null ? contractItem.getTotalPrice() : BigDecimal.ZERO);
            
            log.debug("Создана позиция контракта: {} - {} (поставщик: {}, количество: {}, цена: {})", 
                     proposalItem.getItemNumber(), proposalItem.getDescription(), 
                     supplierProposal.getSupplier().getName(), proposalItem.getQuantity(), proposalItem.getUnitPrice());
        }
        
        // Обновляем итоговую сумму контракта
        savedContract.setTotalAmount(contractTotal);
        contractRepository.save(savedContract);
        
        log.info("Контракт создан успешно: {} с {} позициями. Итого: {}", savedContract.getId(), createdItemsCount, contractTotal);
        
        return getContractById(savedContract.getId());
    }

    @Override
    public Map<String, Long> getStatusStats() {
        Map<String, Long> stats = new java.util.LinkedHashMap<>();
        for (Contract.ContractStatus status : Contract.ContractStatus.values()) {
            stats.put(status.name(), contractRepository.countByStatus(status));
        }
        return stats;
    }
} 