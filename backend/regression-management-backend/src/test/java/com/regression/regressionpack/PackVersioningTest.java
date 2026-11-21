package com.regression.regressionpack;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.regression.BaseIntegrationTest;
import com.regression.util.AuthTestHelper;
import com.regression.util.ExcelTestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Regression tests for how pack versions are built from successive Excel imports. */
class PackVersioningTest extends BaseIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        token = AuthTestHelper.registerAndGetToken(mockMvc, "versioning_" + System.nanoTime() + "@example.com", "password123");
    }

    private static String[] row(String id, String title) {
        return new String[]{"Mod", "Feat", id, title, "", "Do the thing", "It works", "HIGH", "MANUAL", "ACTIVE"};
    }

    private String createPack() throws Exception {
        String res = mockMvc.perform(post("/api/regression-packs").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Versioning pack\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).path("data").path("id").asString();
    }

    /** Imports the rows and returns the new version id. */
    private String importRows(String packId, String[]... rows) throws Exception {
        byte[] xlsx = ExcelTestHelper.buildValidExcel(rows);
        String res = mockMvc.perform(multipart("/api/regression-packs/" + packId + "/import")
                        .file(new MockMultipartFile("file", "tests.xlsx",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", xlsx))
                        .header("Authorization", token))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).path("data").path("newVersionId").asString();
    }

    private JsonNode tests(String packId, String versionId) throws Exception {
        String res = mockMvc.perform(get("/api/regression-packs/" + packId + "/versions/" + versionId + "/tests")
                        .header("Authorization", token))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).path("data");
    }

    private List<String> testIds(String packId, String versionId) throws Exception {
        List<String> ids = new ArrayList<>();
        for (JsonNode n : tests(packId, versionId)) ids.add(n.path("testIdRef").asString());
        return ids;
    }

    @Test
    void reAddingAPreviouslyRemovedTest_succeedsAndReusesTheOldIdentity() throws Exception {
        String packId = createPack();
        importRows(packId, row("TC-1", "One"), row("TC-9", "Nine"));              // v1
        importRows(packId, row("TC-1", "One"));                                    // v2: TC-9 removed
        String v3 = importRows(packId, row("TC-1", "One"), row("TC-9", "Nine"));   // v3: TC-9 back (used to 500)

        assertEquals(List.of("TC-1", "TC-9"), testIds(packId, v3));
    }

    @Test
    void reAddedTestWithEditedContent_getsNextVersionNumber() throws Exception {
        String packId = createPack();
        importRows(packId, row("TC-9", "Nine"));                      // v1
        importRows(packId, row("TC-1", "One"));                       // v2: TC-9 removed
        String v3 = importRows(packId, row("TC-9", "Nine, edited"));  // v3: back with a new title

        JsonNode t = tests(packId, v3).get(0);
        assertEquals("Nine, edited", t.path("title").asString());
        assertEquals(2, t.path("versionNumber").asInt());
    }

    @Test
    void testsComeBackInExcelRowOrder_notAlphabeticalOrRandom() throws Exception {
        String packId = createPack();
        String v1 = importRows(packId,
                row("TC-30", "c"), row("TC-02", "a"), row("TC-77", "z"), row("TC-10", "b"), row("TC-05", "m"));

        assertEquals(List.of("TC-30", "TC-02", "TC-77", "TC-10", "TC-05"), testIds(packId, v1));
    }
}
