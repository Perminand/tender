package ru.perminov.tender.service;

import ru.perminov.tender.dto.project.ProjectDto;
import ru.perminov.tender.dto.project.ProjectDtoNew;
import ru.perminov.tender.dto.project.ProjectDtoUpdate;
import ru.perminov.tender.model.Project;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ProjectService {

    List<ProjectDto> getAll();

    ProjectDto getById(UUID id);

    ProjectDto create(ProjectDtoNew dto);

    ProjectDto update(UUID id, ProjectDtoUpdate dto);

    void delete(UUID id);

    int importFromExcel(MultipartFile file);
} 