package ru.perminov.tender.service;

import ru.perminov.tender.dto.RequestDto;
import java.util.List;
import java.util.UUID;

public interface RequestService {

    List<RequestDto> findAll();

    RequestDto findById(UUID id);

    RequestDto create(RequestDto dto);

    RequestDto update(UUID id, RequestDto dto);

    void delete(UUID id);
} 