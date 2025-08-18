package ru.perminov.tender.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.perminov.tender.dto.tender.TenderItemNoteDto;
import ru.perminov.tender.mapper.TenderItemNoteMapper;
import ru.perminov.tender.model.TenderItem;
import ru.perminov.tender.model.TenderItemNote;
import ru.perminov.tender.model.company.Company;
import ru.perminov.tender.repository.TenderItemNoteRepository;
import ru.perminov.tender.repository.TenderItemRepository;
import ru.perminov.tender.repository.company.CompanyRepository;
import ru.perminov.tender.service.TenderItemNoteService;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenderItemNoteServiceImpl implements TenderItemNoteService {

    private final TenderItemNoteRepository noteRepository;
    private final TenderItemRepository tenderItemRepository;
    private final CompanyRepository companyRepository;
    private final TenderItemNoteMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public TenderItemNoteDto get(UUID tenderItemId, UUID supplierId) {
        return noteRepository.findByTenderItemIdAndSupplierId(tenderItemId, supplierId)
                .map(mapper::toDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public TenderItemNoteDto upsert(UUID tenderItemId, UUID supplierId, String note) {
        TenderItem tenderItem = tenderItemRepository.findById(tenderItemId)
                .orElseThrow(() -> new RuntimeException("Позиция тендера не найдена"));
        Company supplier = companyRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Поставщик не найден"));

        TenderItemNote entity = noteRepository.findByTenderItemIdAndSupplierId(tenderItemId, supplierId)
                .orElseGet(TenderItemNote::new);

        entity.setTenderItem(tenderItem);
        entity.setSupplier(supplier);
        entity.setNote(note != null ? note : "");
        LocalDateTime now = LocalDateTime.now();
        if (entity.getId() == null) {
            entity.setCreatedAt(now);
        }
        entity.setUpdatedAt(now);

        TenderItemNote saved = noteRepository.save(entity);
        log.info("Сохранено примечание для позиции {} и поставщика {}", tenderItemId, supplierId);
        return mapper.toDto(saved);
    }
}


