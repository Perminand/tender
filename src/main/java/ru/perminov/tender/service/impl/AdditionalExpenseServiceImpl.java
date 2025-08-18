package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.AdditionalExpenseDto;
import ru.perminov.tender.mapper.AdditionalExpenseMapper;
import ru.perminov.tender.model.AdditionalExpense;
import ru.perminov.tender.model.SupplierProposal;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.AdditionalExpenseRepository;
import ru.perminov.tender.repository.SupplierProposalRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.AdditionalExpenseService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdditionalExpenseServiceImpl implements AdditionalExpenseService {

    private final AdditionalExpenseRepository additionalExpenseRepository;
    private final AdditionalExpenseMapper additionalExpenseMapper;
    private final SupplierProposalRepository supplierProposalRepository;
    private final CompanyRepository companyRepository;

    @Override
    @Transactional
    public AdditionalExpenseDto createExpense(AdditionalExpenseDto expenseDto) {
        log.info("Создание дополнительного расхода для предложения: {}", expenseDto.getSupplierProposalId());
        
        AdditionalExpense expense = additionalExpenseMapper.toEntity(expenseDto);
        
        // Устанавливаем предложение поставщика
        SupplierProposal proposal = supplierProposalRepository.findById(expenseDto.getSupplierProposalId())
                .orElseThrow(() -> new RuntimeException("Предложение поставщика не найдено"));
        expense.setSupplierProposal(proposal);
        
        // Устанавливаем поставщика расходов если указан
        if (expenseDto.getExpenseProviderId() != null) {
            Company provider = companyRepository.findById(expenseDto.getExpenseProviderId())
                    .orElseThrow(() -> new RuntimeException("Поставщик расходов не найден"));
            expense.setExpenseProvider(provider);
        }
        
        AdditionalExpense savedExpense = additionalExpenseRepository.save(expense);
        log.info("Дополнительный расход создан с ID: {}", savedExpense.getId());
        
        return additionalExpenseMapper.toDto(savedExpense);
    }

    @Override
    @Transactional
    public AdditionalExpenseDto updateExpense(UUID id, AdditionalExpenseDto expenseDto) {
        log.info("Обновление дополнительного расхода: {}", id);
        
        AdditionalExpense existingExpense = additionalExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Дополнительный расход не найден"));
        
        additionalExpenseMapper.updateEntity(existingExpense, expenseDto);
        
        // Обновляем поставщика расходов если изменился
        if (expenseDto.getExpenseProviderId() != null) {
            Company provider = companyRepository.findById(expenseDto.getExpenseProviderId())
                    .orElseThrow(() -> new RuntimeException("Поставщик расходов не найден"));
            existingExpense.setExpenseProvider(provider);
        } else {
            existingExpense.setExpenseProvider(null);
        }
        
        AdditionalExpense savedExpense = additionalExpenseRepository.save(existingExpense);
        log.info("Дополнительный расход обновлен: {}", savedExpense.getId());
        
        return additionalExpenseMapper.toDto(savedExpense);
    }

    @Override
    @Transactional(readOnly = true)
    public AdditionalExpenseDto getExpenseById(UUID id) {
        log.info("Получение дополнительного расхода по ID: {}", id);
        
        AdditionalExpense expense = additionalExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Дополнительный расход не найден"));
        
        return additionalExpenseMapper.toDto(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdditionalExpenseDto> getExpensesByProposal(UUID supplierProposalId) {
        log.info("Получение дополнительных расходов для предложения: {}", supplierProposalId);
        
        List<AdditionalExpense> expenses = additionalExpenseRepository.findBySupplierProposalIdWithRelations(supplierProposalId);
        return additionalExpenseMapper.toDtoList(expenses);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdditionalExpenseDto> getExpensesByStatus(AdditionalExpense.ExpenseStatus status) {
        log.info("Получение дополнительных расходов по статусу: {}", status);
        
        List<AdditionalExpense> expenses = additionalExpenseRepository.findByStatus(status);
        return additionalExpenseMapper.toDtoList(expenses);
    }

    @Override
    @Transactional
    public void deleteExpense(UUID id) {
        log.info("Удаление дополнительного расхода: {}", id);
        
        AdditionalExpense expense = additionalExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Дополнительный расход не найден"));
        
        additionalExpenseRepository.delete(expense);
        log.info("Дополнительный расход удален: {}", id);
    }

    @Override
    @Transactional
    public AdditionalExpenseDto changeExpenseStatus(UUID id, AdditionalExpense.ExpenseStatus status) {
        log.info("Изменение статуса дополнительного расхода {} на: {}", id, status);
        
        AdditionalExpense expense = additionalExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Дополнительный расход не найден"));
        
        expense.setStatus(status);
        AdditionalExpense savedExpense = additionalExpenseRepository.save(expense);
        
        log.info("Статус дополнительного расхода изменен: {} -> {}", id, status);
        return additionalExpenseMapper.toDto(savedExpense);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalApprovedAmountByProposal(UUID supplierProposalId) {
        log.info("Расчет общей суммы одобренных дополнительных расходов для предложения: {}", supplierProposalId);
        
        Double totalAmount = additionalExpenseRepository.getTotalApprovedAmountByProposal(supplierProposalId);
        log.info("Общая сумма одобренных дополнительных расходов: {}", totalAmount);
        
        return totalAmount != null ? totalAmount : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateTotalProposalCost(UUID supplierProposalId) {
        log.info("Расчет общей стоимости предложения с учетом дополнительных расходов: {}", supplierProposalId);
        
        SupplierProposal proposal = supplierProposalRepository.findById(supplierProposalId)
                .orElseThrow(() -> new RuntimeException("Предложение поставщика не найдено"));
        
        // Базовая стоимость предложения
        Double baseCost = proposal.getTotalPrice() != null ? proposal.getTotalPrice() : 0.0;
        
        // Дополнительные расходы
        Double additionalExpenses = getTotalApprovedAmountByProposal(supplierProposalId);
        
        Double totalCost = baseCost + additionalExpenses;
        log.info("Общая стоимость предложения: {} (базовая: {}, дополнительные расходы: {})", 
                totalCost, baseCost, additionalExpenses);
        
        return totalCost;
    }
}
