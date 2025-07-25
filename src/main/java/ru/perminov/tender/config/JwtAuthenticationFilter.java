package ru.perminov.tender.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.perminov.tender.service.JwtService;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        
        String requestURI = request.getRequestURI();
        
        // Пропускаем JWT проверку для публичных путей (используем централизованные константы)
        if (SecurityPaths.isPublicPath(requestURI)) {
            log.debug("Пропускаем JWT проверку для публичного пути: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        log.info("=== JWT Filter Debug ===");
        log.info("Обработка запроса: {} {} от {}", request.getMethod(), requestURI, request.getRemoteAddr());
        log.info("Authorization header: {}", authHeader);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Отсутствует или неверный формат Authorization header для запроса: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        log.info("Извлечен JWT токен: {}", jwt.substring(0, Math.min(20, jwt.length())) + "...");
        
        try {
            username = jwtService.extractUsername(jwt);
            log.info("Извлеченное имя пользователя: {}", username);
            
            if (username != null) {
                log.info("Загрузка UserDetails для пользователя: {}", username);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                log.info("UserDetails загружены, роли: {}", userDetails.getAuthorities());
                
                if (jwtService.validateToken(jwt, userDetails)) {
                    log.info("JWT токен валиден для пользователя: {}", username);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("JWT аутентификация успешна для пользователя: {} с ролями: {}", 
                            username, userDetails.getAuthorities());
                } else {
                    log.warn("JWT токен невалиден для пользователя: {}", username);
                    // Очищаем контекст безопасности если токен невалиден
                    SecurityContextHolder.clearContext();
                }
            } else {
                    log.warn("Не удалось извлечь имя пользователя из JWT токена");
                // Очищаем контекст безопасности если не удалось извлечь username
                SecurityContextHolder.clearContext();
            }
        } catch (Exception e) {
            log.error("Ошибка при обработке JWT токена: {}", e.getMessage(), e);
            // Очищаем контекст безопасности при ошибке
            SecurityContextHolder.clearContext();
        }
        
        log.info("=== End JWT Filter Debug ===");
        filterChain.doFilter(request, response);
    }
} 