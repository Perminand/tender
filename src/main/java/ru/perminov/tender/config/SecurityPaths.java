package ru.perminov.tender.config;

import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Утилитный класс для централизованного управления публичными путями
 * Устраняет дублирование между SecurityConfig и JwtAuthenticationFilter
 */
public final class SecurityPaths {

    private static final Logger logger = LoggerFactory.getLogger(SecurityPaths.class);

    // Приватный конструктор для предотвращения инстанцирования
    private SecurityPaths() {}

    // Константы для публичных путей
    public static final String[] PUBLIC_PATHS = {
        "/api/auth/**",
        "/api/public/**", 
        "/api/health",
        "/error",
        "/actuator/health",
        "/",
        "/index.html",
        "/static/**",
        "/assets/**",
        "/css/**",
        "/js/**",
        "/images/**",
        "/favicon.ico"
    };

    /**
     * Проверяет, является ли путь публичным (не требует аутентификации)
     * 
     * @param requestURI URI запроса
     * @return true если путь публичный, false иначе
     */
    public static boolean isPublicPath(String requestURI) {
        logger.debug("Проверяем путь: {}", requestURI);
        
        boolean result = Arrays.stream(PUBLIC_PATHS)
                .anyMatch(pattern -> {
                    // Обработка паттернов с /**
                    if (pattern.endsWith("/**")) {
                        String basePath = pattern.substring(0, pattern.length() - 2);
                        boolean matches = requestURI.startsWith(basePath);
                        logger.debug("Паттерн {} (базовый путь: {}) -> {}", pattern, basePath, matches);
                        return matches;
                    }
                    // Точное совпадение для остальных паттернов
                    boolean matches = requestURI.equals(pattern);
                    logger.debug("Паттерн {} -> {}", pattern, matches);
                    return matches;
                });
        
        logger.debug("Результат для пути {}: {}", requestURI, result);
        return result;
    }
} 