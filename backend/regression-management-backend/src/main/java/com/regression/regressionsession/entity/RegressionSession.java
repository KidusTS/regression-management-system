package com.regression.regressionsession.entity;

import com.regression.regressionpack.entity.RegressionPackVersion;
import com.regression.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "regression_sessions")
@Getter @Setter
public class RegressionSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_version_id", nullable = false)
    private RegressionPackVersion packVersion;

    @Column(length = 100)
    private String softwareVersion;

    @Column(length = 100)
    private String environment;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private SessionStatus status = SessionStatus.PLANNED;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RegressionExecutionResult> results = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum SessionStatus { PLANNED, IN_PROGRESS, COMPLETED, ABORTED }
}
