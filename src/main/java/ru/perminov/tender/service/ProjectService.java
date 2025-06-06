package ru.perminov.tender.service;

import ru.perminov.tender.dto.project.ProjectDtoNew;
import ru.perminov.tender.dto.project.ProjectDtoUpdate;
import ru.perminov.tender.model.Project;

import java.util.List;
import java.util.UUID;

public interface ProjectService {

    Project create(ProjectDtoNew projectDtoNew);

    Project update(UUID id, ProjectDtoUpdate projectDtoUpdate);

    void delete(UUID id);

    Project getById(UUID id);
    
    List<Project> getAll();
} 