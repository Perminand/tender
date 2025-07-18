package ru.perminov.tender.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Статические ресурсы фронтенда - только для не-API путей
        registry.addResourceHandler("/static/**", "/assets/**", "/css/**", "/js/**", "/images/**", "/favicon.ico")
                .addResourceLocations("classpath:/static/")
                .addResourceLocations("file:frontend/dist/");
        
        // SPA fallback - только для не-API путей
        registry.addResourceHandler("/**")
                .addResourceLocations("file:frontend/dist/")
                .resourceChain(true)
                .addResolver(new org.springframework.web.servlet.resource.PathResourceResolver() {
                    @Override
                    protected org.springframework.core.io.Resource getResource(String resourcePath, 
                            org.springframework.core.io.Resource location) throws java.io.IOException {
                        org.springframework.core.io.Resource resource = super.getResource(resourcePath, location);
                        if (resource == null || !resource.exists()) {
                            // Если ресурс не найден и это не API путь, возвращаем index.html
                            if (!resourcePath.startsWith("/api/")) {
                                return super.getResource("index.html", location);
                            }
                        }
                        return resource;
                    }
                });
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Перенаправляем только не-API запросы к фронтенду на index.html для SPA
        registry.addViewController("/").setViewName("forward:/index.html");
        // Убираем рекурсивные правила, которые могут вызывать зацикливание
    }
} 