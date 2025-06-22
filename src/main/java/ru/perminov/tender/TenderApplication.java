package ru.perminov.tender;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TenderApplication {
    public static void main(String[] args) {
        SpringApplication.run(TenderApplication.class, args);
    }
}