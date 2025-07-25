package ru.perminov.tender.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        log.info("Получен запрос на корневой путь - перенаправляем на index.html");
        return "forward:/index.html";
    }
} 