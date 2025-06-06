package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.project.ProjectDtoNew;
import ru.perminov.tender.dto.project.ProjectDtoUpdate;
import ru.perminov.tender.model.Project;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    Project toProject(ProjectDtoNew dto);
    
    void updateProjectFromDto(ProjectDtoUpdate dto, @MappingTarget Project project);
} 