package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.dto.contract.ContractDtoNew;
import ru.perminov.tender.dto.contract.ContractDtoUpdate;
import ru.perminov.tender.dto.contract.ContractItemDto;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Override
    public ContractDto createContract(ContractDtoNew contractDtoNew) {
        Contract contract = contractMapper.toEntity(contractDtoNew);
        contract.setStatus(Contract.ContractStatus.DRAFT);
        Tender tender = tenderRepository.getReferenceById(contractDtoNew.getTenderId());
        contract.setTender(tender);
        Contract saved = contractRepository.save(contract);
        return contractMapper.toDto(saved);
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
        return contractMapper.toDto(contractRepository.save(contract));
    }

    @Override
    public void deleteContract(UUID id) {
        contractRepository.deleteById(id);
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
        List<ContractItem> items = contractItemRepository.findByContractId(contractId);
        return items.stream().map(item -> {
            ContractItemDto dto = new ContractItemDto();
            dto.setId(item.getId());
            dto.setContractId(contractId);
            dto.setMaterialId(item.getMaterial() != null ? item.getMaterial().getId() : null);
            dto.setMaterialName(item.getMaterial() != null ? item.getMaterial().getName() : "");
            dto.setQuantity(item.getQuantity());
            dto.setUnitName(item.getUnit() != null ? item.getUnit().getName() : "");
            dto.setUnitPrice(item.getUnitPrice());
            dto.setTotalPrice(item.getTotalPrice());
            dto.setDescription(item.getDescription());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public ContractDto createContractFromTender(UUID tenderId, UUID supplierId) {
        log.info("Создание контракта на основе тендера {} и поставщика {}", tenderId, supplierId);
        
        // Получаем тендер с заказчиком
        Tender tender = tenderRepository.findByIdWithCustomer(tenderId)
                .orElseThrow(() -> new RuntimeException("Тендер не найден"));
        Company customer = tender.getCustomer();
        log.info("Tender customer: {}", customer != null ? customer.getName() : "null");
        
        log.info("Найден тендер: {} - {}", tender.getTenderNumber(), tender.getTitle());
        
        // Проверяем статус тендера
        if (tender.getStatus() != Tender.TenderStatus.AWARDED) {
            log.warn("Попытка создания контракта для тендера со статусом {} (требуется AWARDED)", tender.getStatus());
            throw new RuntimeException("Контракт можно создать только для присужденного тендера");
        }
        
        // Получаем предложение поставщика
        List<SupplierProposal> proposals = supplierProposalRepository.findByTenderIdAndSupplierId(tenderId, supplierId);
        log.info("Найдено {} предложений поставщика для тендера {}", proposals.size(), tenderId);
        
        SupplierProposal proposal = proposals.stream()
                .filter(p -> p.getStatus() == SupplierProposal.ProposalStatus.ACCEPTED)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Принятое предложение поставщика не найдено"));
        
        log.info("Найдено принятое предложение: {} от поставщика {}", proposal.getProposalNumber(), supplierId);
        
        // Получаем поставщика
        Company supplier = companyRepository.findById(supplierId)
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
        contract.setStartDate(LocalDate.now());
        
        // Устанавливаем дату окончания из тендера или по умолчанию
        if (tender.getEndDate() != null) {
            contract.setEndDate(tender.getEndDate().toLocalDate());
        } else {
            contract.setEndDate(LocalDate.now().plusYears(1)); // По умолчанию +1 год
        }
        
        contract.setStatus(Contract.ContractStatus.DRAFT);
        contract.setTotalAmount(BigDecimal.valueOf(proposal.getTotalPrice()));
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
        log.info("Контракт сохранен с ID: {}", savedContract.getId());
        
        // Создаем позиции контракта на основе позиций предложения
        List<ProposalItem> proposalItems = proposalItemRepository.findBySupplierProposalId(proposal.getId());
        log.info("Найдено {} позиций в предложении поставщика", proposalItems.size());
        
        int createdItemsCount = 0;
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
            contractItem.setUnit(proposalItem.getUnit());
            contractItem.setUnitPrice(BigDecimal.valueOf(proposalItem.getUnitPrice()));
            contractItem.setTotalPrice(BigDecimal.valueOf(proposalItem.getTotalPrice()));
            contractItem.setSpecifications(proposalItem.getSpecifications());
            contractItem.setDeliveryPeriod(proposalItem.getDeliveryPeriod());
            contractItem.setWarranty(proposalItem.getWarranty());
            contractItem.setAdditionalInfo(proposalItem.getAdditionalInfo());
            
            contractItemRepository.save(contractItem);
            createdItemsCount++;
            
            log.debug("Создана позиция контракта: {} - {} (количество: {}, цена: {})", 
                     proposalItem.getItemNumber(), proposalItem.getDescription(), 
                     proposalItem.getQuantity(), proposalItem.getUnitPrice());
        }
        
        log.info("Контракт создан успешно: {} с {} позициями", savedContract.getId(), createdItemsCount);
        
        // Возвращаем контракт с позициями
        return getContractById(savedContract.getId());
    }
} 