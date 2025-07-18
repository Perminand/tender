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
        
        log.info("=== JWT Filter Debug ===");
        log.info("Обработка запроса: {} {} от {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
        log.info("Authorization header: {}", authHeader);
        log.info("User-Agent: {}", request.getHeader("User-Agent"));
        log.info("Origin: {}", request.getHeader("Origin"));
        log.info("Referer: {}", request.getHeader("Referer"));
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Не логируем предупреждения для публичных путей
            String requestURI = request.getRequestURI();
            if (!requestURI.equals("/") && !requestURI.equals("/health") && 
                !requestURI.startsWith("/api/auth/") && !requestURI.startsWith("/api/public/") &&
                !requestURI.startsWith("/static/") && !requestURI.startsWith("/assets/") &&
                !requestURI.startsWith("/css/") && !requestURI.startsWith("/js/") &&
                !requestURI.startsWith("/images/") && !requestURI.equals("/favicon.ico")) {
                log.warn("Отсутствует или неверный формат Authorization header для запроса: {}", requestURI);
            }
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        log.info("Извлечен JWT токен: {}", jwt.substring(0, Math.min(20, jwt.length())) + "...");
        
        try {
            username = jwtService.extractUsername(jwt);
            log.info("Извлеченное имя пользователя: {}", username);
            
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
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
                }
            } else {
                if (username == null) {
                    log.warn("Не удалось извлечь имя пользователя из JWT токена");
                } else {
                    log.info("Пользователь уже аутентифицирован: {}", username);
                }
            }
        } catch (Exception e) {
            log.error("Ошибка при обработке JWT токена: {}", e.getMessage(), e);
        }
        
        log.info("=== End JWT Filter Debug ===");
        filterChain.doFilter(request, response);
    }
} 