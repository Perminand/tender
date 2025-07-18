package ru.perminov.tender.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Статические ресурсы фронтенда
        registry.addResourceHandler("/static/**", "/assets/**", "/css/**", "/js/**", "/images/**", "/favicon.ico")
                .addResourceLocations("classpath:/static/")
                .addResourceLocations("file:frontend/dist/");
        
        // SPA fallback - для всех не-API путей
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .addResourceLocations("file:frontend/dist/")
                .resourceChain(true)
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver() {
                    @Override
                    protected org.springframework.core.io.Resource getResource(String resourcePath, 
                            org.springframework.core.io.Resource location) throws java.io.IOException {
                        // Сначала ищем в classpath:/static/
                        org.springframework.core.io.Resource resource = super.getResource(resourcePath, location);
                        if (resource == null || !resource.exists()) {
                            // Если ресурс не найден в classpath, ищем в file:frontend/dist/
                            try {
                                resource = super.getResource(resourcePath, 
                                    new org.springframework.core.io.FileSystemResource("frontend/dist/"));
                            } catch (Exception e) {
                                // Игнорируем ошибки
                            }
                        }
                        
                        // Если ресурс все еще не найден и это не API путь, возвращаем index.html
                        if ((resource == null || !resource.exists()) && !resourcePath.startsWith("/api/")) {
                            // Сначала пробуем найти index.html в classpath
                            resource = super.getResource("index.html", location);
                            if (resource == null || !resource.exists()) {
                                // Если не найден в classpath, ищем в file:frontend/dist/
                                try {
                                    resource = super.getResource("index.html", 
                                        new org.springframework.core.io.FileSystemResource("frontend/dist/"));
                                } catch (Exception e) {
                                    // Игнорируем ошибки
                                }
                            }
                        }
                        return resource;
                    }
                });
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Убираем все view controllers, так как используем resource handlers
    }
} 