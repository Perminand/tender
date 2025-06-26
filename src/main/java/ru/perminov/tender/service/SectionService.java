package ru.perminov.tender.service;

import ru.perminov.tender.dto.section.SectionDto;
import java.util.List;
import java.util.UUID;

public interface SectionService {

    List<SectionDto> getSectionsByProject(UUID projectId);

    SectionDto createSection(SectionDto sectionDto);

} 