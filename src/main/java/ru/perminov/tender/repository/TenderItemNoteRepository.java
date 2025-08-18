package ru.perminov.tender.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.perminov.tender.model.TenderItemNote;

import java.util.Optional;
import java.util.UUID;

public interface TenderItemNoteRepository extends JpaRepository<TenderItemNote, UUID> {

    @Query("select n from TenderItemNote n where n.tenderItem.id = :itemId and n.supplier.id = :supplierId")
    Optional<TenderItemNote> findByTenderItemIdAndSupplierId(@Param("itemId") UUID tenderItemId,
                                                             @Param("supplierId") UUID supplierId);
}


