package com.regression.report.service;

import com.regression.common.exception.ResourceNotFoundException;
import com.regression.report.dto.SessionSummaryDto;
import com.regression.report.dto.TrendReportDto;
import com.regression.regressionsession.entity.RegressionExecutionResult;
import com.regression.regressionsession.entity.RegressionExecutionResult.ExecutionResult;
import com.regression.regressionsession.entity.RegressionSession;
import com.regression.regressionsession.repository.RegressionExecutionResultRepository;
import com.regression.regressionsession.repository.RegressionSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final RegressionSessionRepository sessionRepository;
    private final RegressionExecutionResultRepository resultRepository;

    @Transactional(readOnly = true)
    public SessionSummaryDto getSessionSummary(UUID sessionId) {
        RegressionSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        List<RegressionExecutionResult> results = resultRepository.findAllBySessionId(sessionId);
        int total   = results.size();
        int passed  = count(results, ExecutionResult.PASS);
        int failed  = count(results, ExecutionResult.FAIL);
        int blocked = count(results, ExecutionResult.BLOCKED);
        int skipped = count(results, ExecutionResult.SKIPPED);
        int notRun  = count(results, ExecutionResult.NOT_RUN);
        double passRate = total > 0 ? (double) passed / total * 100 : 0;

        return SessionSummaryDto.builder()
                .sessionId(sessionId)
                .sessionName(session.getName())
                .total(total)
                .passed(passed)
                .failed(failed)
                .blocked(blocked)
                .skipped(skipped)
                .notRun(notRun)
                .passRate(Math.round(passRate * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TrendReportDto> getPackTrends(UUID packId) {
        return sessionRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(s -> s.getPackVersion().getRegressionPack().getId().equals(packId))
                .map(s -> {
                    List<RegressionExecutionResult> results = resultRepository.findAllBySessionId(s.getId());
                    int total  = results.size();
                    int passed = count(results, ExecutionResult.PASS);
                    double passRate = total > 0 ? Math.round((double) passed / total * 10000.0) / 100.0 : 0;
                    return TrendReportDto.builder()
                            .sessionId(s.getId())
                            .sessionName(s.getName())
                            .softwareVersion(s.getSoftwareVersion())
                            .total(total)
                            .passed(passed)
                            .passRate(passRate)
                            .createdAt(s.getCreatedAt())
                            .build();
                }).toList();
    }

    private int count(List<RegressionExecutionResult> results, ExecutionResult type) {
        return (int) results.stream().filter(r -> r.getResult() == type).count();
    }
}
