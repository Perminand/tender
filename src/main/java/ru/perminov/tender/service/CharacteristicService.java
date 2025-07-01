package ru.perminov.tender.service;

import ru.perminov.tender.dto.CharacteristicDto;
import java.util.List;
import java.util.UUID;

public interface CharacteristicService {

    List<CharacteristicDto> findAll();

    CharacteristicDto save(CharacteristicDto dto);
    
    void delete(UUID id);
} 