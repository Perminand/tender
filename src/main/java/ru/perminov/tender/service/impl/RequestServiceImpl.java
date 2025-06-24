package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.mapper.RequestMapper;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.service.RequestService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RequestServiceImpl implements RequestService {
    private final RequestRepository requestRepository;
    private final RequestMapper requestMapper;

    @Override
    public List<RequestDto> findAll() {
        return requestRepository.findAll().stream()
                .map(requestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public RequestDto findById(UUID id) {
        return requestRepository.findById(id)
                .map(requestMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
    }

    @Override
    public RequestDto create(RequestDto dto) {
        Request entity = requestMapper.toEntity(dto);
        return requestMapper.toDto(requestRepository.save(entity));
    }

    @Override
    public RequestDto update(UUID id, RequestDto dto) {
        Request existing = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        Request updated = requestMapper.toEntity(dto);
        updated.setId(existing.getId());
        return requestMapper.toDto(requestRepository.save(updated));
    }

    @Override
    public void delete(UUID id) {
        requestRepository.deleteById(id);
    }
} 