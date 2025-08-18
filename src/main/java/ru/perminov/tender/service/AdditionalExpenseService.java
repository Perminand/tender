package ru.perminov.tender.service;

import ru.perminov.tender.dto.AdditionalExpenseDto;
import ru.perminov.tender.model.AdditionalExpense;

import java.util.List;
import java.util.UUID;

public interface AdditionalExpenseService {
    
    /**
     * Создать дополнительный расход
     */
    AdditionalExpenseDto createExpense(AdditionalExpenseDto expenseDto);
    
    /**
     * Обновить дополнительный расход
     */
    AdditionalExpenseDto updateExpense(UUID id, AdditionalExpenseDto expenseDto);
    
    /**
     * Получить дополнительный расход по ID
     */
    AdditionalExpenseDto getExpenseById(UUID id);
    
    /**
     * Получить все дополнительные расходы по предложению поставщика
     */
    List<AdditionalExpenseDto> getExpensesByProposal(UUID supplierProposalId);
    
    /**
     * Получить все дополнительные расходы по статусу
     */
    List<AdditionalExpenseDto> getExpensesByStatus(AdditionalExpense.ExpenseStatus status);
    
    /**
     * Удалить дополнительный расход
     */
    void deleteExpense(UUID id);
    
    /**
     * Изменить статус дополнительного расхода
     */
    AdditionalExpenseDto changeExpenseStatus(UUID id, AdditionalExpense.ExpenseStatus status);
    
    /**
     * Получить общую сумму одобренных дополнительных расходов по предложению
     */
    Double getTotalApprovedAmountByProposal(UUID supplierProposalId);
    
    /**
     * Рассчитать общую стоимость предложения с учетом дополнительных расходов
     */
    Double calculateTotalProposalCost(UUID supplierProposalId);
}
