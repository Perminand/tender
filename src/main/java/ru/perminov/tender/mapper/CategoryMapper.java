package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.CategoryDto;
import ru.perminov.tender.dto.CategoryDtoNew;
import ru.perminov.tender.dto.CategoryDtoUpdate;
import ru.perminov.tender.model.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory(CategoryDtoNew dto);
    CategoryDto toCategoryDto(Category category);
    void updateCategoryFromDto(CategoryDtoUpdate dto, @MappingTarget Category category);
} 