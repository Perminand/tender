package ru.perminov.tender.service;

import ru.perminov.tender.dto.RequestRegistryRowDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

public interface RequestRegistryService {
    List<RequestRegistryRowDto> getRegistry(String organization, String project, LocalDate fromDate, LocalDate toDate, String materialName);
    ByteArrayInputStream exportRegistryToExcel(String organization, String project, LocalDate fromDate, LocalDate toDate, String materialName);
} 