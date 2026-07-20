package com.regression.regressiontest.controller;

import com.regression.common.response.ApiResponse;
import com.regression.regressiontest.dto.RegressionTestVersionDto;
import com.regression.regressiontest.service.RegressionTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class RegressionTestController {

    private final RegressionTestService testService;

    @GetMapping("/api/regression-packs/{packId}/versions/{versionId}/tests")
    public ResponseEntity<ApiResponse<List<RegressionTestVersionDto>>> getTestsInVersion(
            @PathVariable UUID packId, @PathVariable UUID versionId) {
        return ResponseEntity.ok(ApiResponse.ok(testService.findTestsInVersion(packId, versionId)));
    }
}
