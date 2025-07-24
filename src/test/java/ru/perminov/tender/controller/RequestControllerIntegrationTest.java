//package ru.perminov.tender.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.ResultActions;
//import ru.perminov.tender.dto.RequestDto;
//
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//public class RequestControllerIntegrationTest {
//    @Autowired
//    private MockMvc mockMvc;
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Test
//    void createAndGetRequest() throws Exception {
//        // Создание заявки
//        RequestDto dto = new RequestDto();
//        // Заполните dto необходимыми полями для успешного создания
//        String json = objectMapper.writeValueAsString(dto);
//
//        ResultActions createResult = mockMvc.perform(post("/api/requests")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(json));
//        createResult.andExpect(status().isOk());
//
//        // Получение списка заявок
//        mockMvc.perform(get("/api/requests"))
//                .andExpect(status().isOk());
//    }
//}