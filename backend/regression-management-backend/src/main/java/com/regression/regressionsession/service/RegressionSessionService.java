package com.regression.regressionsession.service;

import com.regression.common.exception.ResourceNotFoundException;
import com.regression.regressionpack.entity.RegressionPackVersion;
import com.regression.regressionpack.repository.RegressionPackVersionRepository;
import com.regression.regressionsession.dto.*;
import com.regression.regressionsession.entity.RegressionExecutionResult;
import com.regression.regressionsession.entity.RegressionExecutionResult.ExecutionResult;
import com.regression.regressionsession.entity.RegressionSession;
import com.regression.regressionsession.entity.RegressionSession.SessionStatus;
import com.regression.regressionsession.repository.RegressionExecutionResultRepository;
import com.regression.regressionsession.repository.RegressionSessionRepository;
import com.regression.regressiontest.entity.RegressionTestVersion;
import com.regression.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegressionSessionService {

    private final RegressionSessionRepository sessionRepository;
    private final RegressionExecutionResultRepository resultRepository;
    private final RegressionPackVersionRepository packVersionRepository;

    @Transactional(readOnly = true)
    public List<RegressionSessionDto> findAll() {
        return sessionRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public RegressionSessionDto findById(UUID id) {
        return toDto(getSessionOrThrow(id));
    }

    @Transactional
    public RegressionSessionDto create(CreateSessionRequest request, User createdBy) {
        RegressionPackVersion packVersion = packVersionRepository.findByIdWithDetails(request.getPackVersionId())
                .orElseThrow(() -> new ResourceNotFoundException("Pack version not found: " + request.getPackVersionId()));

        RegressionSession session = new RegressionSession();
        session.setName(request.getName());
        session.setDescription(request.getDescription());
        session.setPackVersion(packVersion);
        session.setSoftwareVersion(request.getSoftwareVersion());
        session.setEnvironment(request.getEnvironment());
        session.setCreatedBy(createdBy);
        sessionRepository.save(session);

        // Pre-populate execution results for every test in the pack version
        for (RegressionTestVersion tv : packVersion.getTestVersions()) {
            RegressionExecutionResult result = new RegressionExecutionResult();
            result.setSession(session);
            result.setTestVersion(tv);
            resultRepository.save(result);
        }

        return toDto(session);
    }

    @Transactional
    public RegressionSessionDto updateStatus(UUID id, UpdateSessionStatusRequest request) {
        RegressionSession session = getSessionOrThrow(id);
        SessionStatus newStatus = SessionStatus.valueOf(request.getStatus().toUpperCase());
        session.setStatus(newStatus);

        if (newStatus == SessionStatus.IN_PROGRESS && session.getStartedAt() == null) {
            session.setStartedAt(LocalDateTime.now());
        }
        if (newStatus == SessionStatus.COMPLETED || newStatus == SessionStatus.ABORTED) {
            session.setCompletedAt(LocalDateTime.now());
        }

        return toDto(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<ExecutionResultDto> findResults(UUID sessionId) {
        getSessionOrThrow(sessionId);
        return resultRepository.findAllBySessionId(sessionId)
                .stream().map(this::toResultDto).toList();
    }

    @Transactional
    public ExecutionResultDto updateResult(UUID sessionId, UUID resultId, UpdateResultRequest request, User user) {
        RegressionExecutionResult result = resultRepository.findByIdWithDetails(resultId)
                .filter(r -> r.getSession().getId().equals(sessionId))
                .orElseThrow(() -> new ResourceNotFoundException("Result not found"));

        result.setResult(ExecutionResult.valueOf(request.getResult().toUpperCase()));
        result.setComment(request.getComment());
        result.setExecutedBy(user);
        result.setExecutedAt(LocalDateTime.now());

        return toResultDto(resultRepository.save(result));
    }

    @Transactional
    public List<ExecutionResultDto> bulkUpdateResults(UUID sessionId, BulkUpdateResultRequest request, User user) {
        getSessionOrThrow(sessionId);
        return request.getResults().stream().map(entry -> {
            RegressionExecutionResult result = resultRepository.findByIdWithDetails(entry.getResultId())
                    .filter(r -> r.getSession().getId().equals(sessionId))
                    .orElseThrow(() -> new ResourceNotFoundException("Result not found: " + entry.getResultId()));

            result.setResult(ExecutionResult.valueOf(entry.getResult().toUpperCase()));
            result.setComment(entry.getComment());
            result.setExecutedBy(user);
            result.setExecutedAt(LocalDateTime.now());
            return toResultDto(resultRepository.save(result));
        }).toList();
    }

    private RegressionSession getSessionOrThrow(UUID id) {
        return sessionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + id));
    }

    private RegressionSessionDto toDto(RegressionSession s) {
        RegressionSessionDto dto = new RegressionSessionDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setDescription(s.getDescription());
        dto.setPackVersionId(s.getPackVersion().getId());
        dto.setPackVersionNumber(s.getPackVersion().getVersionNumber());
        dto.setPackName(s.getPackVersion().getRegressionPack().getName());
        dto.setSoftwareVersion(s.getSoftwareVersion());
        dto.setEnvironment(s.getEnvironment());
        dto.setStatus(s.getStatus().name());
        dto.setTotalTests(packVersionRepository.countTestsByVersionId(s.getPackVersion().getId()));
        dto.setStartedAt(s.getStartedAt());
        dto.setCompletedAt(s.getCompletedAt());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());

        // Tally results
        List<RegressionExecutionResult> results = s.getResults();
        dto.setPassed((int) results.stream().filter(r -> r.getResult() == ExecutionResult.PASS).count());
        dto.setFailed((int) results.stream().filter(r -> r.getResult() == ExecutionResult.FAIL).count());
        dto.setBlocked((int) results.stream().filter(r -> r.getResult() == ExecutionResult.BLOCKED).count());
        dto.setSkipped((int) results.stream().filter(r -> r.getResult() == ExecutionResult.SKIPPED).count());
        dto.setNotRun((int) results.stream().filter(r -> r.getResult() == ExecutionResult.NOT_RUN).count());

        return dto;
    }

    private ExecutionResultDto toResultDto(RegressionExecutionResult r) {
        ExecutionResultDto dto = new ExecutionResultDto();
        dto.setId(r.getId());
        dto.setSessionId(r.getSession().getId());
        dto.setTestVersionId(r.getTestVersion().getId());
        dto.setTestIdRef(r.getTestVersion().getRegressionTest().getTestIdRef());
        dto.setTestTitle(r.getTestVersion().getTitle());
        dto.setModule(r.getTestVersion().getModule());
        dto.setFeature(r.getTestVersion().getFeature());
        dto.setResult(r.getResult().name());
        dto.setComment(r.getComment());
        dto.setExecutedAt(r.getExecutedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}
