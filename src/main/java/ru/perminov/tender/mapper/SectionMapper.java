package ru.perminov.tender.mapper;

import org.springframework.stereotype.Component;
import ru.perminov.tender.dto.section.SectionDto;
import ru.perminov.tender.model.Project;
import ru.perminov.tender.model.Section;

@Component
public class SectionMapper {
    public SectionDto toDto(Section section) {
        SectionDto dto = new SectionDto();
        dto.setId(section.getId());
        dto.setName(section.getName());
        dto.setProjectId(section.getProject().getId());
        return dto;
    }

    public Section toEntity(SectionDto dto, Project project) {
        Section section = new Section();
        section.setId(dto.getId());
        section.setName(dto.getName());
        section.setProject(project);
        return section;
    }
} 