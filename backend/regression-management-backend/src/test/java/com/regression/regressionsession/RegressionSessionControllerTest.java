package com.regression.regressionsession;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.regression.BaseIntegrationTest;
import com.regression.util.AuthTestHelper;
import com.regression.util.ExcelTestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RegressionSessionControllerTest extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    private String token;
    private String packVersionId;

    @BeforeEach
    void setUp() throws Exception {
        token = AuthTestHelper.registerAndGetToken(
                mockMvc,
                "session_test_" + System.nanoTime() + "@example.com",
                "password123"
        );
        packVersionId = createPackWithVersion();
    }

    // ── Create Session ────────────────────────────────────────────────────────

    @Test
    void createSession_validRequest_returnsSessionWithPrePopulatedResults() throws Exception {
        mockMvc.perform(post("/api/regression-sessions")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Sprint 1 Regression",
                                  "packVersionId": "%s",
                                  "softwareVersion": "1.0.0",
                                  "environment": "Staging"
                                }
                                """.formatted(packVersionId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Sprint 1 Regression"))
                .andExpect(jsonPath("$.data.status").value("PLANNED"))
                .andExpect(jsonPath("$.data.totalTests").value(3))
                .andExpect(jsonPath("$.data.notRun").value(3))
                .andExpect(jsonPath("$.data.passed").value(0));
    }

    @Test
    void createSession_invalidPackVersionId_returns404() throws Exception {
        mockMvc.perform(post("/api/regression-sessions")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Bad Session",
                                  "packVersionId": "00000000-0000-0000-0000-000000000000"
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void createSession_missingName_returns400() throws Exception {
        mockMvc.perform(post("/api/regression-sessions")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"packVersionId": "%s"}
                                """.formatted(packVersionId)))
                .andExpect(status().isBadRequest());
    }

    // ── Get Sessions ──────────────────────────────────────────────────────────

    @Test
    void getAll_returnsList() throws Exception {
        createSession("List Test Session");

        mockMvc.perform(get("/api/regression-sessions")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getById_existingSession_returnsSession() throws Exception {
        String sessionId = createSession("GetById Session");

        mockMvc.perform(get("/api/regression-sessions/" + sessionId)
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(sessionId));
    }

    @Test
    void getById_nonExistent_returns404() throws Exception {
        mockMvc.perform(get("/api/regression-sessions/00000000-0000-0000-0000-000000000000")
                        .header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    // ── Status Transitions ────────────────────────────────────────────────────

    @Test
    void updateStatus_plannedToInProgress_setsStartedAt() throws Exception {
        String sessionId = createSession("Status Transition Session");

        mockMvc.perform(put("/api/regression-sessions/" + sessionId + "/status")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status": "IN_PROGRESS"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.startedAt").isNotEmpty());
    }

    @Test
    void updateStatus_inProgressToCompleted_setsCompletedAt() throws Exception {
        String sessionId = createSession("Complete Session");

        mockMvc.perform(put("/api/regression-sessions/" + sessionId + "/status")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"IN_PROGRESS\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/regression-sessions/" + sessionId + "/status")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.completedAt").isNotEmpty());
    }

    @Test
    void updateStatus_invalidStatus_returns400() throws Exception {
        String sessionId = createSession("Invalid Status Session");

        mockMvc.perform(put("/api/regression-sessions/" + sessionId + "/status")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"INVALID_STATUS\"}"))
                .andExpect(status().isBadRequest());
    }

    // ── Execution Results ─────────────────────────────────────────────────────

    @Test
    void getResults_returnsPrePopulatedResults() throws Exception {
        String sessionId = createSession("Results Session");

        mockMvc.perform(get("/api/regression-sessions/" + sessionId + "/results")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(3))
                .andExpect(jsonPath("$.data[0].result").value("NOT_RUN"));
    }

    @Test
    void updateResult_validRequest_updatesResultAndTally() throws Exception {
        String sessionId = createSession("Update Result Session");
        String resultId = getFirstResultId(sessionId);

        mockMvc.perform(put("/api/regression-sessions/" + sessionId + "/results/" + resultId)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"result": "PASS", "comment": "Looks good"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.result").value("PASS"))
                .andExpect(jsonPath("$.data.comment").value("Looks good"));

        // Tally should reflect the update
        mockMvc.perform(get("/api/regression-sessions/" + sessionId)
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.passed").value(1))
                .andExpect(jsonPath("$.data.notRun").value(2));
    }

    @Test
    void bulkUpdateResults_updatesMultipleResults() throws Exception {
        String sessionId = createSession("Bulk Update Session");
        String[] resultIds = getAllResultIds(sessionId);

        String bulkBody = """
                {
                  "results": [
                    {"resultId": "%s", "result": "PASS"},
                    {"resultId": "%s", "result": "FAIL", "comment": "Bug found"},
                    {"resultId": "%s", "result": "BLOCKED"}
                  ]
                }
                """.formatted(resultIds[0], resultIds[1], resultIds[2]);

        mockMvc.perform(put("/api/regression-sessions/" + sessionId + "/results/bulk")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulkBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3));

        mockMvc.perform(get("/api/regression-sessions/" + sessionId)
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.passed").value(1))
                .andExpect(jsonPath("$.data.failed").value(1))
                .andExpect(jsonPath("$.data.blocked").value(1))
                .andExpect(jsonPath("$.data.notRun").value(0));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String createPackWithVersion() throws Exception {
        // Create pack
        String packResponse = mockMvc.perform(post("/api/regression-packs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Session Test Pack " + System.nanoTime() + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String packId = objectMapper.readTree(packResponse).path("data").path("id").asText();

        // Import Excel to create a version with 3 tests
        byte[] xlsx = ExcelTestHelper.buildValidExcel(ExcelTestHelper.sampleRows());
        String importResponse = mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "tests.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(importResponse).path("data").path("newVersionId").asText();
    }

    private String createSession(String name) throws Exception {
        String response = mockMvc.perform(post("/api/regression-sessions")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "%s", "packVersionId": "%s"}
                                """.formatted(name, packVersionId)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).path("data").path("id").asText();
    }

    private String getFirstResultId(String sessionId) throws Exception {
        String response = mockMvc.perform(get("/api/regression-sessions/" + sessionId + "/results")
                        .header("Authorization", token))
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).path("data").get(0).path("id").asText();
    }

    private String[] getAllResultIds(String sessionId) throws Exception {
        String response = mockMvc.perform(get("/api/regression-sessions/" + sessionId + "/results")
                        .header("Authorization", token))
                .andReturn().getResponse().getContentAsString();

        JsonNode data = objectMapper.readTree(response).path("data");
        return new String[]{
                data.get(0).path("id").asText(),
                data.get(1).path("id").asText(),
                data.get(2).path("id").asText()
        };
    }
}
