package com.regression.regressionpack.controller;

import com.regression.common.response.ApiResponse;
import com.regression.regressionpack.dto.*;
import com.regression.regressionpack.service.RegressionPackService;
import com.regression.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/regression-packs")
@RequiredArgsConstructor
public class RegressionPackController {

    private final RegressionPackService packService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegressionPackDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(packService.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RegressionPackDto>> create(
            @Valid @RequestBody CreateRegressionPackRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(packService.create(request, user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RegressionPackDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(packService.findById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RegressionPackDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CreateRegressionPackRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(packService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        packService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Regression pack deleted", null));
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<ApiResponse<List<RegressionPackVersionDto>>> getVersions(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(packService.findVersions(id)));
    }

    @GetMapping("/{id}/versions/{versionId}")
    public ResponseEntity<ApiResponse<RegressionPackVersionDto>> getVersion(
            @PathVariable UUID id, @PathVariable UUID versionId) {
        return ResponseEntity.ok(ApiResponse.ok(packService.findVersion(id, versionId)));
    }

    @GetMapping("/{id}/versions/{versionId}/export")
    public ResponseEntity<byte[]> exportExcel(
            @PathVariable UUID id, @PathVariable UUID versionId) {
        byte[] bytes = packService.exportExcel(id, versionId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"regression-pack-v" + versionId + ".xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @PostMapping("/{id}/import")
    public ResponseEntity<ApiResponse<ImportResultDto>> importExcel(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(packService.importExcel(id, file, user)));
    }
}
