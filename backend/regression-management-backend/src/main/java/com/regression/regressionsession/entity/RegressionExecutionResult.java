package com.regression.regressionsession.entity;

import com.regression.attachment.entity.Attachment;
import com.regression.regressiontest.entity.RegressionTestVersion;
import com.regression.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "regression_execution_results")
@Getter @Setter
public class RegressionExecutionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private RegressionSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_version_id", nullable = false)
    private RegressionTestVersion testVersion;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ExecutionResult result = ExecutionResult.NOT_RUN;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "executed_by")
    private User executedBy;

    private LocalDateTime executedAt;

    @OneToMany(mappedBy = "executionResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum ExecutionResult { PASS, FAIL, BLOCKED, SKIPPED, NOT_RUN }
}
