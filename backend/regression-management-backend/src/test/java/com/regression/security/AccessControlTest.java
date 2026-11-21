package com.regression.security;

import tools.jackson.databind.ObjectMapper;
import com.regression.BaseIntegrationTest;
import com.regression.user.entity.Role;
import com.regression.user.entity.User;
import com.regression.user.repository.RoleRepository;
import com.regression.user.repository.UserRepository;
import com.regression.util.AuthTestHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AccessControlTest extends BaseIntegrationTest {

    private static final String NEW_PACK = "{\"name\":\"Access pack\"}";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;

    /** Registers a user, then swaps their role directly in the DB. Roles are read per request, so the token stays valid. */
    private String registerWithRole(String email, String roleName) throws Exception {
        String token = AuthTestHelper.registerAndGetToken(mockMvc, email, "password123");
        User user = userRepository.findByEmail(email).orElseThrow();
        Role role = roleRepository.findByName(roleName).orElseThrow();
        user.setRoles(Set.of(role));
        userRepository.save(user);
        return token;
    }

    private String createPack(String token) throws Exception {
        String res = mockMvc.perform(post("/api/regression-packs").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(NEW_PACK))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).path("data").path("id").asString();
    }

    @Test
    void noToken_returns401_notForbidden() throws Exception {
        mockMvc.perform(get("/api/regression-packs")).andExpect(status().isUnauthorized());
    }

    @Test
    void garbageToken_returns401() throws Exception {
        mockMvc.perform(get("/api/regression-packs").header("Authorization", "Bearer not.a.jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void viewer_canRead_butCannotWrite() throws Exception {
        String token = registerWithRole("viewer_" + System.nanoTime() + "@example.com", "VIEWER");

        mockMvc.perform(get("/api/regression-packs").header("Authorization", token)).andExpect(status().isOk());
        mockMvc.perform(post("/api/regression-packs").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(NEW_PACK))
                .andExpect(status().isForbidden());
    }

    @Test
    void qaEngineer_canCreatePack_butCannotDeleteIt() throws Exception {
        String token = registerWithRole("eng_" + System.nanoTime() + "@example.com", "QA_ENGINEER");
        String id = createPack(token);

        mockMvc.perform(delete("/api/regression-packs/" + id).header("Authorization", token))
                .andExpect(status().isForbidden());
    }

    @Test
    void qaLead_canDeletePack() throws Exception {
        String token = registerWithRole("lead_" + System.nanoTime() + "@example.com", "QA_LEAD");
        String id = createPack(token);

        mockMvc.perform(delete("/api/regression-packs/" + id).header("Authorization", token))
                .andExpect(status().isOk());
    }

    @Test
    void registeringWithTheConfiguredAdminEmail_grantsAdmin() throws Exception {
        AuthTestHelper.registerAndGetToken(mockMvc, "admin-bootstrap@example.com", "password123");
        User admin = userRepository.findByEmail("admin-bootstrap@example.com").orElseThrow();
        assertTrue(admin.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN")));
    }

    @Test
    void newUsersDefaultToQaEngineer() throws Exception {
        String email = "plain_" + System.nanoTime() + "@example.com";
        AuthTestHelper.registerAndGetToken(mockMvc, email, "password123");
        User u = userRepository.findByEmail(email).orElseThrow();
        assertTrue(u.getRoles().stream().allMatch(r -> r.getName().equals("QA_ENGINEER")));
    }
}
