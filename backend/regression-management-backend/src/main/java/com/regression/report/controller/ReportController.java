package com.regression.report.controller;

import com.regression.common.response.ApiResponse;
import com.regression.report.dto.SessionSummaryDto;
import com.regression.report.dto.TrendReportDto;
import com.regression.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sessions/{id}/summary")
    public ResponseEntity<ApiResponse<SessionSummaryDto>> sessionSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getSessionSummary(id)));
    }

    @GetMapping("/packs/{id}/trends")
    public ResponseEntity<ApiResponse<List<TrendReportDto>>> packTrends(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getPackTrends(id)));
    }
}
