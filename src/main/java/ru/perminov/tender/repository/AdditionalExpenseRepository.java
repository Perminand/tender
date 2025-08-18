package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.AdditionalExpense;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdditionalExpenseRepository extends JpaRepository<AdditionalExpense, UUID> {
    
    /**
     * Найти дополнительные расходы по предложению поставщика
     */
    List<AdditionalExpense> findBySupplierProposalId(UUID supplierProposalId);
    
    /**
     * Найти дополнительные расходы по статусу
     */
    List<AdditionalExpense> findByStatus(AdditionalExpense.ExpenseStatus status);
    
    /**
     * Найти дополнительные расходы по поставщику расходов
     */
    List<AdditionalExpense> findByExpenseProviderId(UUID expenseProviderId);
    
    /**
     * Найти дополнительные расходы по типу
     */
    List<AdditionalExpense> findByExpenseType(String expenseType);
    
    /**
     * Найти дополнительные расходы с загрузкой связанных данных
     */
    @Query("SELECT ae FROM AdditionalExpense ae " +
           "LEFT JOIN FETCH ae.supplierProposal " +
           "LEFT JOIN FETCH ae.expenseProvider " +
           "WHERE ae.supplierProposal.id = :supplierProposalId")
    List<AdditionalExpense> findBySupplierProposalIdWithRelations(@Param("supplierProposalId") UUID supplierProposalId);
    
    /**
     * Получить общую сумму дополнительных расходов по предложению
     */
    @Query("SELECT COALESCE(SUM(ae.amount), 0) FROM AdditionalExpense ae WHERE ae.supplierProposal.id = :supplierProposalId AND ae.status = 'APPROVED'")
    Double getTotalApprovedAmountByProposal(@Param("supplierProposalId") UUID supplierProposalId);
}
