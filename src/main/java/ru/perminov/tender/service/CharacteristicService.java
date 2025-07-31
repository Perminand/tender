package ru.perminov.tender.service;

import ru.perminov.tender.dto.CharacteristicDto;
import ru.perminov.tender.dto.CharacteristicDtoNew;
import java.util.List;
import java.util.UUID;

public interface CharacteristicService {

    List<CharacteristicDto> findAll();

    CharacteristicDto save(CharacteristicDto dto);
    
    CharacteristicDto saveWithMaterial(CharacteristicDtoNew dto);
    
    void delete(UUID id);
} 