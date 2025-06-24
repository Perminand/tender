package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.perminov.tender.dto.WarehouseDto;
import ru.perminov.tender.mapper.WarehouseMapper;
import ru.perminov.tender.repository.WarehouseRepository;
import ru.perminov.tender.service.WarehouseService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {
    private final WarehouseRepository repository;
    private final WarehouseMapper mapper;

    @Override
    public List<WarehouseDto> findAll() {
        return repository.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    public WarehouseDto save(WarehouseDto dto) {
        return mapper.toDto(repository.save(mapper.toEntity(dto)));
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }
} 