package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.worktype.WorkTypeDto;
import ru.perminov.tender.mapper.WorkTypeMapper;
import ru.perminov.tender.model.WorkType;
import ru.perminov.tender.repository.WorkTypeRepository;
import ru.perminov.tender.service.WorkTypeService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkTypeServiceImpl implements WorkTypeService {
    private final WorkTypeRepository workTypeRepository;
    private final WorkTypeMapper workTypeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<WorkTypeDto> getAllWorkTypes() {
        return workTypeRepository.findAll()
                .stream()
                .map(workTypeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WorkTypeDto createWorkType(WorkTypeDto workTypeDto) {
        WorkType workType = new WorkType();
        workType.setName(workTypeDto.getName());
        workType = workTypeRepository.save(workType);
        return workTypeMapper.toDto(workType);
    }
} 