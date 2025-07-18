package ru.perminov.tender.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import ru.perminov.tender.service.CustomUserDetailsService;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("Настройка конфигурации безопасности");
        
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Публичные эндпоинты
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                
                // Эндпоинты для администраторов - полный доступ
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/settings/**").hasAnyRole("ADMIN", "MANAGER")
                
                // Эндпоинты для аналитиков
                .requestMatchers("/api/analytics/**").hasAnyRole("ADMIN", "ANALYST")
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "ANALYST", "MANAGER")
                
                // Эндпоинты для менеджеров
                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "MANAGER", "ANALYST")
                .requestMatchers("/api/alerts/**").hasAnyRole("ADMIN", "MANAGER", "ANALYST")
                
                // Эндпоинты для поставщиков
                .requestMatchers("/api/supplier/**").hasAnyRole("SUPPLIER", "ADMIN")
                
                // Эндпоинты для заказчиков
                .requestMatchers("/api/customer/**").hasAnyRole("CUSTOMER", "ADMIN")
                
                // Основные эндпоинты системы - доступ для всех аутентифицированных пользователей
                .requestMatchers("/api/requests/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/tenders/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/contracts/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/deliveries/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/payments/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/documents/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/proposals/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/projects/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/materials/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/categories/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/units/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/warehouses/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/companies/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/contacts/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/banks/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/notifications/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                .requestMatchers("/api/price-analysis/**").hasAnyRole("ADMIN", "MANAGER", "USER", "ANALYST")
                
                // Остальные эндпоинты требуют аутентификации
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
 