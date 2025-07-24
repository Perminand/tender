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
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import ru.perminov.tender.dto.ImportResultDto;
import ru.perminov.tender.service.AuditLogService;
import ru.perminov.tender.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import ru.perminov.tender.model.User;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    @Transactional
    public Category create(CategoryDtoNew categoryDtoNew) {
        if (categoryRepository.existsByName(categoryDtoNew.name())) {
            throw new RuntimeException("Категория с именем '" + categoryDtoNew.name() + "' уже существует");
        }
        Category category = categoryMapper.toCategory(categoryDtoNew);
        Category saved = categoryRepository.save(category);
        auditLogService.logSimple(getCurrentUser(), "CREATE_CATEGORY", "Category", saved.getId().toString(), "Создана категория");
        return saved;
    }

    @Override
    @Transactional
    public Category update(UUID id, CategoryDtoUpdate categoryDtoUpdate) {
        Category existingCategory = getById(id);
        categoryMapper.updateCategoryFromDto(categoryDtoUpdate, existingCategory);
        Category updated = categoryRepository.save(existingCategory);
        auditLogService.logSimple(getCurrentUser(), "UPDATE_CATEGORY", "Category", updated.getId().toString(), "Обновлена категория");
        return updated;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        categoryRepository.deleteById(id);
        auditLogService.logSimple(getCurrentUser(), "DELETE_CATEGORY", "Category", id.toString(), "Удалена категория");
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
    public ImportResultDto importFromExcel(org.springframework.web.multipart.MultipartFile file) {
        ImportResultDto result = new ImportResultDto();
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skipping header
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    String name = getCellValueAsString(row.getCell(1));

                    if (name == null || name.isBlank()) {
                        result.addError(i + 1, "Название не может быть пустым.");
                        continue;
                    }

                    if (categoryRepository.existsByName(name)) {
                        result.addError(i + 1, "Категория с названием '" + name + "' уже существует.");
                        continue;
                    }
                    Category category = new Category();
                    category.setName(name);
                    Category saved = categoryRepository.save(category);
                    auditLogService.logSimple(null, "IMPORT_CATEGORY", "Category", saved.getId().toString(), "Импортирована категория");
                    result.incrementImported();
                } catch (Exception e) {
                    result.addError(i + 1, "Ошибка в строке: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Ошибка импорта файла: " + e.getMessage(), e);
        }
        return result;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            default:
                return null;
        }
    }
} 