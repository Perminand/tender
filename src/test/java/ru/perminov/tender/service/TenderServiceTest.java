package ru.perminov.tender.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TenderServiceTest {

    @Test
    void contextLoads() {
        // Проверяем, что контекст загружается
    }
} 