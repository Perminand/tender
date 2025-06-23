package ru.perminov.tender.service;

import ru.perminov.tender.dto.ProjectObjectDto;
import ru.perminov.tender.dto.ProjectObjectDtoNew;
import ru.perminov.tender.dto.ProjectObjectDtoUpdate;

import java.util.List;
import java.util.UUID;

public interface ProjectObjectService {

    List<ProjectObjectDto> getAll();

    ProjectObjectDto getById(UUID id);

    ProjectObjectDto create(ProjectObjectDtoNew projectObjectDtoNew);

    ProjectObjectDto update(UUID id, ProjectObjectDtoUpdate projectObjectDtoUpdate);

    void delete(UUID id);
} 