package com.regression.util;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthTestHelper {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static String registerAndGetToken(MockMvc mockMvc, String email, String password) throws Exception {
        String body = """
                {
                  "email": "%s",
                  "password": "%s",
                  "firstName": "Test",
                  "lastName": "User"
                }
                """.formatted(email, password);

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = mapper.readTree(response);
        return "Bearer " + root.path("data").path("token").asText();
    }
}
