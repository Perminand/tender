package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.AdditionalExpenseDto;
import ru.perminov.tender.model.AdditionalExpense;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AdditionalExpenseMapper {
    
    /**
     * Преобразовать модель в DTO
     */
    @Mapping(target = "supplierProposalId", source = "supplierProposal.id")
    @Mapping(target = "expenseProviderId", source = "expenseProvider.id")
    @Mapping(target = "expenseProviderName", expression = "java(additionalExpense.getExpenseProvider() != null ? additionalExpense.getExpenseProvider().getName() : null)")
    AdditionalExpenseDto toDto(AdditionalExpense additionalExpense);
    
    /**
     * Преобразовать список моделей в список DTO
     */
    List<AdditionalExpenseDto> toDtoList(List<AdditionalExpense> additionalExpenses);
    
    /**
     * Преобразовать DTO в модель
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "supplierProposal", ignore = true)
    @Mapping(target = "expenseProvider", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AdditionalExpense toEntity(AdditionalExpenseDto additionalExpenseDto);
    
    /**
     * Обновить модель из DTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "supplierProposal", ignore = true)
    @Mapping(target = "expenseProvider", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget AdditionalExpense additionalExpense, AdditionalExpenseDto additionalExpenseDto);
}
