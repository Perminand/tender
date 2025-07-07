package ru.perminov.tender;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QuickTest {

    @Test
    void testBasicAssertions() {
        // Простой тест для проверки, что JUnit работает
        assertTrue(true);
        assertEquals(2 + 2, 4);
        assertNotNull("Hello");
    }

    @Test
    void testStringOperations() {
        String test = "Hello, World!";
        assertTrue(test.contains("Hello"));
        assertEquals(13, test.length());
    }

    @Test
    void testArrayOperations() {
        int[] numbers = {1, 2, 3};
        assertEquals(3, numbers.length);
        assertEquals(1, numbers[0]);
    }
} 