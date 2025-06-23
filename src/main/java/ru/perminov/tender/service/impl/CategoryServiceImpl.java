package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.CategoryDtoNew;
import ru.perminov.tender.dto.CategoryDtoUpdate;
import ru.perminov.tender.mapper.CategoryMapper;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.repository.CategoryRepository;
import ru.perminov.tender.service.CategoryService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public Category create(CategoryDtoNew categoryDtoNew) {
        if (categoryRepository.existsByName(categoryDtoNew.name())) {
            throw new RuntimeException("Категория с именем '" + categoryDtoNew.name() + "' уже существует");
        }
        Category category = categoryMapper.toCategory(categoryDtoNew);
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category update(UUID id, CategoryDtoUpdate categoryDtoUpdate) {
        Category existingCategory = getById(id);
        categoryMapper.updateCategoryFromDto(categoryDtoUpdate, existingCategory);
        return categoryRepository.save(existingCategory);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public Category getById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Override
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    @Override
    @Transactional
    public int importFromExcel(org.springframework.web.multipart.MultipartFile file) {
        try (java.io.InputStream is = file.getInputStream();
             org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(is)) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            int count = 0;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // пропускаем header
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null) continue;
                String name = row.getCell(1) != null ? row.getCell(1).getStringCellValue() : null;
                if (name == null || name.isBlank()) continue;
                if (categoryRepository.existsByName(name)) continue;
                Category category = new Category();
                category.setName(name);
                categoryRepository.save(category);
                count++;
            }
            return count;
        } catch (Exception e) {
            throw new RuntimeException("Ошибка импорта: " + e.getMessage(), e);
        }
    }
} 