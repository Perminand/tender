package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.CharacteristicDto;
import ru.perminov.tender.dto.CharacteristicDtoNew;
import ru.perminov.tender.mapper.CharacteristicMapper;
import ru.perminov.tender.model.Characteristic;
import ru.perminov.tender.model.Material;
import ru.perminov.tender.repository.CharacteristicRepository;
import ru.perminov.tender.repository.MaterialRepository;
import ru.perminov.tender.service.CharacteristicService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CharacteristicServiceImpl implements CharacteristicService {
    private final CharacteristicRepository repository;
    private final MaterialRepository materialRepository;
    private final CharacteristicMapper mapper;

    @Override
    public List<CharacteristicDto> findAll() {
        return repository.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    public CharacteristicDto save(CharacteristicDto dto) {
        Characteristic entity = mapper.toEntity(dto);
        return mapper.toDto(repository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public CharacteristicDto saveWithMaterial(CharacteristicDtoNew dto) {
        Material material = materialRepository.findById(dto.materialId())
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + dto.materialId()));
        
        Characteristic characteristic = new Characteristic();
        characteristic.setName(dto.name());
        characteristic.setDescription(dto.description());
        characteristic.setMaterial(material);
        
        Characteristic saved = repository.save(characteristic);
        return mapper.toDto(saved);
    }
} 