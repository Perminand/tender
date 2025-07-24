package ru.perminov.tender.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import ru.perminov.tender.dto.RequestDto;
import ru.perminov.tender.mapper.RequestMapper;
import ru.perminov.tender.model.Request;
import ru.perminov.tender.repository.RequestRepository;
import ru.perminov.tender.service.impl.RequestServiceImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RequestServiceImplTest {
    @Mock
    private RequestRepository requestRepository;
    @Mock
    private RequestMapper requestMapper;
    @Mock
    private OrgSupplierMaterialMappingService orgSupplierMaterialMappingService;
    @InjectMocks
    private RequestServiceImpl requestService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateRequest() {
        RequestDto dto = mock(RequestDto.class);
        Request entity = mock(Request.class);
        when(requestMapper.toEntity(dto)).thenReturn(entity);
        when(requestRepository.save(entity)).thenReturn(entity);
        when(requestMapper.toDto(entity)).thenReturn(dto);

        RequestDto result = requestService.create(dto);
        assertNotNull(result);
        verify(requestRepository).save(entity);
        verify(requestMapper).toDto(entity);
    }

    @Test
    void testUpdateRequest() {
        RequestDto dto = mock(RequestDto.class);
        Request entity = mock(Request.class);
        when(requestRepository.findByIdWithMaterials(any())).thenReturn(java.util.Optional.of(entity));
        doNothing().when(requestMapper).updateRequestFromDto(dto, entity);
        when(requestRepository.save(entity)).thenReturn(entity);
        when(requestMapper.toDto(entity)).thenReturn(dto);

        RequestDto result = requestService.update(java.util.UUID.randomUUID(), dto);
        assertNotNull(result);
        verify(requestRepository).save(entity);
        verify(requestMapper).toDto(entity);
    }

    @Test
    void testUpdateRequest_NotFound() {
        RequestDto dto = mock(RequestDto.class);
        when(requestRepository.findByIdWithMaterials(any())).thenReturn(java.util.Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> requestService.update(java.util.UUID.randomUUID(), dto));
    }

    @Test
    void testFindById() {
        Request entity = mock(Request.class);
        RequestDto dto = mock(RequestDto.class);
        java.util.UUID id = java.util.UUID.randomUUID();
        when(requestRepository.findByIdWithMaterials(id)).thenReturn(java.util.Optional.of(entity));
        when(requestMapper.toDto(entity)).thenReturn(dto);

        RequestDto result = requestService.findById(id);
        assertNotNull(result);
        verify(requestMapper).toDto(entity);
    }

    @Test
    void testFindById_NotFound() {
        java.util.UUID id = java.util.UUID.randomUUID();
        when(requestRepository.findByIdWithMaterials(id)).thenReturn(java.util.Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> requestService.findById(id));
    }

    @Test
    void testDelete() {
        java.util.UUID id = java.util.UUID.randomUUID();
        doNothing().when(requestRepository).deleteById(id);
        requestService.delete(id);
        verify(requestRepository).deleteById(id);
    }

    @Test
    void testDelete_NotFound() {
        java.util.UUID id = java.util.UUID.randomUUID();
        doThrow(new RuntimeException("Not found")).when(requestRepository).deleteById(id);
        assertThrows(RuntimeException.class, () -> requestService.delete(id));
    }
} 