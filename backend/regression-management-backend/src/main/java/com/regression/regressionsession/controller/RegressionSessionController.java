package com.regression.regressionsession.controller;

import com.regression.common.response.ApiResponse;
import com.regression.regressionsession.dto.*;
import com.regression.regressionsession.service.RegressionSessionService;
import com.regression.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import com.regression.security.Access;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/regression-sessions")
@RequiredArgsConstructor
public class RegressionSessionController {

    private final RegressionSessionService sessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegressionSessionDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.findAll()));
    }

    @PreAuthorize(Access.CAN_WRITE)
    @PostMapping
    public ResponseEntity<ApiResponse<RegressionSessionDto>> create(
            @Valid @RequestBody CreateSessionRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.create(request, user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RegressionSessionDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.findById(id)));
    }

    @PreAuthorize(Access.CAN_WRITE)
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RegressionSessionDto>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSessionStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.updateStatus(id, request)));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<ApiResponse<List<ExecutionResultDto>>> getResults(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.findResults(id)));
    }

    @PreAuthorize(Access.CAN_WRITE)
    @PutMapping("/{id}/results/{resultId}")
    public ResponseEntity<ApiResponse<ExecutionResultDto>> updateResult(
            @PathVariable UUID id,
            @PathVariable UUID resultId,
            @Valid @RequestBody UpdateResultRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.updateResult(id, resultId, request, user)));
    }

    @PreAuthorize(Access.CAN_WRITE)
    @PutMapping("/{id}/results/bulk")
    public ResponseEntity<ApiResponse<List<ExecutionResultDto>>> bulkUpdateResults(
            @PathVariable UUID id,
            @Valid @RequestBody BulkUpdateResultRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.bulkUpdateResults(id, request, user)));
    }
}
