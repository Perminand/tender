package ru.perminov.tender;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BasicTest {

    @Test
    void testBasicMath() {
        // Простой тест математики
        assertEquals(4, 2 + 2);
        assertTrue(5 > 3);
        assertFalse(1 > 10);
    }

    @Test
    void testStringOperations() {
        // Тест строковых операций
        String testString = "Hello, World!";
        assertTrue(testString.contains("Hello"));
        assertEquals(13, testString.length());
        assertTrue(testString.startsWith("Hello"));
    }

    @Test
    void testArrayOperations() {
        // Тест работы с массивами
        int[] numbers = {1, 2, 3, 4, 5};
        assertEquals(5, numbers.length);
        assertEquals(1, numbers[0]);
        assertEquals(5, numbers[4]);
    }

    @Test
    void testObjectCreation() {
        // Тест создания объектов
        Object obj = new Object();
        assertNotNull(obj);
        assertTrue(obj instanceof Object);
    }
} 