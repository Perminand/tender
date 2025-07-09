package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.contract.ContractDto;
import ru.perminov.tender.dto.contract.ContractDtoNew;
import ru.perminov.tender.dto.contract.ContractDtoUpdate;
import ru.perminov.tender.dto.contract.ContractItemDto;
import ru.perminov.tender.mapper.ContractMapper;
import ru.perminov.tender.model.Contract;
import ru.perminov.tender.model.ContractItem;
import ru.perminov.tender.repository.ContractItemRepository;
import ru.perminov.tender.repository.ContractRepository;
import ru.perminov.tender.service.ContractService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContractServiceImpl implements ContractService {
    private final ContractRepository contractRepository;
    private final ContractItemRepository contractItemRepository;
    private final ContractMapper contractMapper;

    @Override
    public ContractDto createContract(ContractDtoNew contractDtoNew) {
        Contract contract = contractMapper.toEntity(contractDtoNew);
        contract.setStatus(Contract.ContractStatus.DRAFT);
        Contract saved = contractRepository.save(contract);
        return contractMapper.toDto(saved);
    }

    @Override
    public ContractDto getContractById(UUID id) {
        return contractRepository.findById(id)
                .map(contractMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<ContractDto> getAllContracts() {
        return contractMapper.toDtoList(contractRepository.findAll());
    }

    @Override
    public List<ContractDto> getContractsByStatus(String status) {
        try {
            Contract.ContractStatus contractStatus = Contract.ContractStatus.valueOf(status.toUpperCase());
            return contractMapper.toDtoList(contractRepository.findByStatus(contractStatus));
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @Override
    public List<ContractDto> getContractsBySupplier(UUID supplierId) {
        return contractMapper.toDtoList(contractRepository.findBySupplierId(supplierId));
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
        // TODO: реализовать создание контракта на основе выигранного тендера
        return null;
    }
} 