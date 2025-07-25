package ru.perminov.tender.repository.company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.perminov.tender.model.company.Bank;

@Repository
public interface BankRepository extends JpaRepository<Bank, String> {
} 