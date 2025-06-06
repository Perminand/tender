package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.project.ProjectDtoNew;
import ru.perminov.tender.dto.project.ProjectDtoUpdate;
import ru.perminov.tender.mapper.ProjectMapper;
import ru.perminov.tender.model.Project;
import ru.perminov.tender.repository.ProjectRepository;
import ru.perminov.tender.service.ProjectService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    @Override
    @Transactional
    public Project create(ProjectDtoNew projectDtoNew) {
        if (projectRepository.existsByName(projectDtoNew.name())) {
            throw new RuntimeException("Проект с именем '" + projectDtoNew.name() + "' уже существует");
        }
        Project project = projectMapper.toProject(projectDtoNew);
        return projectRepository.save(project);
    }

    @Override
    @Transactional
    public Project update(UUID id, ProjectDtoUpdate projectDtoUpdate) {
        Project existingProject = getById(id);
        projectMapper.updateProjectFromDto(projectDtoUpdate, existingProject);
        return projectRepository.save(existingProject);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        projectRepository.deleteById(id);
    }

    @Override
    public Project getById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Проект не найден с id: " + id));
    }

    @Override
    public List<Project> getAll() {
        return projectRepository.findAll();
    }
} 