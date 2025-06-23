package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.ProjectObjectDto;
import ru.perminov.tender.dto.ProjectObjectDtoNew;
import ru.perminov.tender.dto.ProjectObjectDtoUpdate;
import ru.perminov.tender.mapper.ProjectObjectMapper;
import ru.perminov.tender.model.ProjectObject;
import ru.perminov.tender.repository.ProjectObjectRepository;
import ru.perminov.tender.service.ProjectObjectService;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectObjectServiceImpl implements ProjectObjectService {

    private final ProjectObjectRepository projectObjectRepository;
    private final ProjectObjectMapper projectObjectMapper;

    @Override
    public List<ProjectObjectDto> getAll() {
        log.info("Получение всех объектов проекта");
        return projectObjectRepository.findAll().stream()
                .map(projectObjectMapper::toDto)
                .toList();
    }

    @Override
    public ProjectObjectDto getById(UUID id) {
        log.info("Получение объекта проекта с id: {}", id);
        ProjectObject projectObject = projectObjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Объект проекта не найден с id: " + id));
        return projectObjectMapper.toDto(projectObject);
    }

    @Override
    public ProjectObjectDto create(ProjectObjectDtoNew projectObjectDtoNew) {
        log.info("Создание нового объекта проекта: {}", projectObjectDtoNew);
        ProjectObject projectObject = projectObjectMapper.toEntity(projectObjectDtoNew);
        ProjectObject savedProjectObject = projectObjectRepository.save(projectObject);
        return projectObjectMapper.toDto(savedProjectObject);
    }

    @Override
    public ProjectObjectDto update(UUID id, ProjectObjectDtoUpdate projectObjectDtoUpdate) {
        log.info("Обновление объекта проекта с id {}: {}", id, projectObjectDtoUpdate);
        ProjectObject projectObject = projectObjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Объект проекта не найден с id: " + id));
        
        projectObjectMapper.updateEntity(projectObject, projectObjectDtoUpdate);
        ProjectObject updatedProjectObject = projectObjectRepository.save(projectObject);
        return projectObjectMapper.toDto(updatedProjectObject);
    }

    @Override
    public void delete(UUID id) {
        log.info("Удаление объекта проекта с id: {}", id);
        if (!projectObjectRepository.existsById(id)) {
            throw new RuntimeException("Объект проекта не найден с id: " + id);
        }
        projectObjectRepository.deleteById(id);
    }
} 