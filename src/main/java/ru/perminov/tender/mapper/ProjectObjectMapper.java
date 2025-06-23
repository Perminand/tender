package ru.perminov.tender.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import ru.perminov.tender.dto.ProjectObjectDto;
import ru.perminov.tender.dto.ProjectObjectDtoNew;
import ru.perminov.tender.dto.ProjectObjectDtoUpdate;
import ru.perminov.tender.model.ProjectObject;

@Mapper(componentModel = "spring")
public interface ProjectObjectMapper {

    ProjectObjectDto toDto(ProjectObject projectObject);

    ProjectObject toEntity(ProjectObjectDtoNew projectObjectDtoNew);

    void updateEntity(@MappingTarget ProjectObject projectObject, ProjectObjectDtoUpdate projectObjectDtoUpdate);
} 