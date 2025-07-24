package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.perminov.tender.dto.project.ProjectDto;
import ru.perminov.tender.dto.project.ProjectDtoNew;
import ru.perminov.tender.dto.project.ProjectDtoUpdate;
import ru.perminov.tender.mapper.ProjectMapper;
import ru.perminov.tender.model.Project;
import ru.perminov.tender.repository.ProjectRepository;
import ru.perminov.tender.service.AuditLogService;
import ru.perminov.tender.service.ProjectService;
import ru.perminov.tender.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import ru.perminov.tender.model.User;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String username = auth.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public List<ProjectDto> getAll() {
        return projectRepository.findAll().stream().map(projectMapper::toDto).toList();
    }

    @Override
    public ProjectDto getById(UUID id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found: " + id));
        return projectMapper.toDto(project);
    }

    @Override
    @Transactional
    public ProjectDto create(ProjectDtoNew dto) {
        Project project = projectMapper.toEntity(dto);
        ProjectDto saved = projectMapper.toDto(projectRepository.save(project));
        auditLogService.logSimple(getCurrentUser(), "CREATE_PROJECT", "Project", saved.id().toString(), "Создан проект");
        return saved;
    }

    @Override
    @Transactional
    public ProjectDto update(UUID id, ProjectDtoUpdate dto) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found: " + id));
        projectMapper.updateEntity(project, dto);
        ProjectDto updated = projectMapper.toDto(projectRepository.save(project));
        auditLogService.logSimple(getCurrentUser(), "UPDATE_PROJECT", "Project", updated.id().toString(), "Обновлен проект");
        return updated;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        projectRepository.deleteById(id);
        auditLogService.logSimple(getCurrentUser(), "DELETE_PROJECT", "Project", id.toString(), "Удален проект");
    }

    @Override
    @Transactional
    public int importFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            int count = 0;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // пропускаем header
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String name = row.getCell(1) != null ? row.getCell(1).getStringCellValue() : null;
                String description = row.getCell(2) != null ? row.getCell(2).getStringCellValue() : "";
                if (name == null || name.isBlank()) continue;
                Project project = new Project();
                project.setName(name);
                project.setDescription(description);
                projectRepository.save(project);
                count++;
            }
            return count;
        } catch (Exception e) {
            throw new RuntimeException("Ошибка импорта: " + e.getMessage(), e);
        }
    }
} 