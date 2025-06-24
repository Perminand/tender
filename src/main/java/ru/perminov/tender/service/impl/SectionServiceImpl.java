package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.section.SectionDto;
import ru.perminov.tender.mapper.SectionMapper;
import ru.perminov.tender.model.Project;
import ru.perminov.tender.model.Section;
import ru.perminov.tender.repository.ProjectRepository;
import ru.perminov.tender.repository.SectionRepository;
import ru.perminov.tender.service.SectionService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SectionServiceImpl implements SectionService {
    private final SectionRepository sectionRepository;
    private final ProjectRepository projectRepository;
    private final SectionMapper sectionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SectionDto> getSectionsByProject(UUID projectId) {
        return sectionRepository.findByProjectId(projectId)
                .stream()
                .map(sectionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SectionDto createSection(SectionDto sectionDto) {
        Project project = projectRepository.findById(sectionDto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        Section section = sectionMapper.toEntity(sectionDto, project);
        section = sectionRepository.save(section);
        return sectionMapper.toDto(section);
    }
} 