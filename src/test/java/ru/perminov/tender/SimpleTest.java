package ru.perminov.tender;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class SimpleTest {

    @Test
    void testContextLoads() {
        // Простой тест для проверки, что контекст Spring Boot загружается
        assertTrue(true);
    }

    @Test
    void testBasicFunctionality() {
        // Тест базовой функциональности
        String testString = "Hello, World!";
        assertTrue(testString.contains("Hello"));
        assertTrue(testString.length() > 0);
    }
} 