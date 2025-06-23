package ru.perminov.tender.service;

import ru.perminov.tender.dto.CategoryDto;
import ru.perminov.tender.dto.CategoryDtoNew;
import ru.perminov.tender.dto.CategoryDtoUpdate;
import ru.perminov.tender.model.Category;
import ru.perminov.tender.dto.ImportResultDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    Category create(CategoryDtoNew categoryDtoNew);

    Category update(UUID id, CategoryDtoUpdate categoryDtoUpdate);

    void delete(UUID id);

    Category getById(UUID id);

    List<Category> getAll();

    ImportResultDto importFromExcel(MultipartFile file);

} 