package com.regression.regressionpack;

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

class RegressionPackControllerTest extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        token = AuthTestHelper.registerAndGetToken(
                mockMvc,
                "pack_test_" + System.nanoTime() + "@example.com",
                "password123"
        );
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Test
    void createPack_validRequest_returnsCreatedPack() throws Exception {
        mockMvc.perform(post("/api/regression-packs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Checkout Flow", "project": "E-Commerce"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Checkout Flow"))
                .andExpect(jsonPath("$.data.project").value("E-Commerce"))
                .andExpect(jsonPath("$.data.isActive").value(true));
    }

    @Test
    void createPack_missingName_returns400() throws Exception {
        mockMvc.perform(post("/api/regression-packs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"project": "E-Commerce"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createPack_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/regression-packs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Checkout Flow"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAll_returnsList() throws Exception {
        mockMvc.perform(post("/api/regression-packs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Pack For List Test"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/regression-packs")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getById_existingPack_returnsPack() throws Exception {
        String packId = createPackAndGetId("Pack For GetById");

        mockMvc.perform(get("/api/regression-packs/" + packId)
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(packId))
                .andExpect(jsonPath("$.data.name").value("Pack For GetById"));
    }

    @Test
    void getById_nonExistentPack_returns404() throws Exception {
        mockMvc.perform(get("/api/regression-packs/00000000-0000-0000-0000-000000000000")
                        .header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatePack_validRequest_returnsUpdatedPack() throws Exception {
        String packId = createPackAndGetId("Original Name");

        mockMvc.perform(put("/api/regression-packs/" + packId)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Updated Name", "project": "New Project"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Updated Name"))
                .andExpect(jsonPath("$.data.project").value("New Project"));
    }

    @Test
    void deletePack_existingPack_softDeletesIt() throws Exception {
        String packId = createPackAndGetId("Pack To Delete");

        mockMvc.perform(delete("/api/regression-packs/" + packId)
                        .header("Authorization", token))
                .andExpect(status().isOk());

        // Soft-deleted pack should no longer appear in list
        String listResponse = mockMvc.perform(get("/api/regression-packs")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode list = objectMapper.readTree(listResponse).path("data");
        for (JsonNode node : list) {
            assert !node.path("id").asText().equals(packId);
        }
    }

    // ── Excel Import ──────────────────────────────────────────────────────────

    @Test
    void importExcel_validFile_createsVersionWithCorrectCounts() throws Exception {
        String packId = createPackAndGetId("Import Test Pack");
        byte[] xlsx = ExcelTestHelper.buildValidExcel(ExcelTestHelper.sampleRows());

        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "tests.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.versionNumber").value(1))
                .andExpect(jsonPath("$.data.added").value(3))
                .andExpect(jsonPath("$.data.modified").value(0))
                .andExpect(jsonPath("$.data.unchanged").value(0))
                .andExpect(jsonPath("$.data.total").value(3));
    }

    @Test
    void importExcel_secondImportSameData_allUnchanged() throws Exception {
        String packId = createPackAndGetId("Unchanged Import Pack");
        byte[] xlsx = ExcelTestHelper.buildValidExcel(ExcelTestHelper.sampleRows());

        // First import
        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "tests.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk());

        // Second import — identical data
        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "tests.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.versionNumber").value(2))
                .andExpect(jsonPath("$.data.added").value(0))
                .andExpect(jsonPath("$.data.modified").value(0))
                .andExpect(jsonPath("$.data.unchanged").value(3));
    }

    @Test
    void importExcel_modifiedTest_detectedAsModified() throws Exception {
        String packId = createPackAndGetId("Modified Import Pack");
        byte[] firstXlsx = ExcelTestHelper.buildValidExcel(ExcelTestHelper.sampleRows());

        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "v1.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", firstXlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk());

        // Second import — TC-001 title changed
        String[][] modifiedRows = {
                {"Login", "Authentication", "TC-001", "Valid login UPDATED", "User exists", "Enter credentials", "Dashboard shown", "HIGH", "MANUAL", "ACTIVE"},
                {"Login", "Authentication", "TC-002", "Invalid password", "User exists", "Enter wrong password", "Error shown", "HIGH", "MANUAL", "ACTIVE"},
                {"Dashboard", "Overview", "TC-003", "Load dashboard", "", "Navigate to dashboard", "Stats visible", "MEDIUM", "MANUAL", "ACTIVE"},
        };
        byte[] secondXlsx = ExcelTestHelper.buildValidExcel(modifiedRows);

        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "v2.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", secondXlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.versionNumber").value(2))
                .andExpect(jsonPath("$.data.modified").value(1))
                .andExpect(jsonPath("$.data.unchanged").value(2));
    }

    @Test
    void importExcel_removedTest_countedAsRemoved() throws Exception {
        String packId = createPackAndGetId("Removed Import Pack");
        byte[] firstXlsx = ExcelTestHelper.buildValidExcel(ExcelTestHelper.sampleRows());

        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "v1.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", firstXlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk());

        // Second import — TC-003 removed
        String[][] reducedRows = {
                {"Login", "Authentication", "TC-001", "Valid login", "User exists", "Enter credentials", "Dashboard shown", "HIGH", "MANUAL", "ACTIVE"},
                {"Login", "Authentication", "TC-002", "Invalid password", "User exists", "Enter wrong password", "Error shown", "HIGH", "MANUAL", "ACTIVE"},
        };
        byte[] secondXlsx = ExcelTestHelper.buildValidExcel(reducedRows);

        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "v2.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", secondXlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.removed").value(1))
                .andExpect(jsonPath("$.data.unchanged").value(2));
    }

    @Test
    void importExcel_missingRequiredField_returns400() throws Exception {
        String packId = createPackAndGetId("Validation Test Pack");

        // TC-002 has no title
        String[][] invalidRows = {
                {"Login", "Auth", "TC-001", "Valid login", "", "Steps", "Expected", "HIGH", "MANUAL", "ACTIVE"},
                {"Login", "Auth", "TC-002", "", "", "Steps", "Expected", "HIGH", "MANUAL", "ACTIVE"},
        };
        byte[] xlsx = ExcelTestHelper.buildValidExcel(invalidRows);

        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "bad.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsx))
                        .header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void importExcel_duplicateTestId_returns400() throws Exception {
        String packId = createPackAndGetId("Duplicate ID Pack");

        String[][] duplicateRows = {
                {"Login", "Auth", "TC-001", "Test One", "", "Steps", "Expected", "HIGH", "MANUAL", "ACTIVE"},
                {"Login", "Auth", "TC-001", "Test One Duplicate", "", "Steps", "Expected", "HIGH", "MANUAL", "ACTIVE"},
        };
        byte[] xlsx = ExcelTestHelper.buildValidExcel(duplicateRows);

        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "dup.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsx))
                        .header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getVersions_afterImport_returnsVersionList() throws Exception {
        String packId = createPackAndGetId("Versions List Pack");
        byte[] xlsx = ExcelTestHelper.buildValidExcel(ExcelTestHelper.sampleRows());

        mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "tests.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/regression-packs/" + packId + "/versions")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].testCount").value(3));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private String createPackAndGetId(String name) throws Exception {
        String response = mockMvc.perform(post("/api/regression-packs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"" + name + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).path("data").path("id").asText();
    }
}
