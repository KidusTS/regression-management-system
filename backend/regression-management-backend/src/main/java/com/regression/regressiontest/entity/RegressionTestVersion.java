package com.regression.regressiontest.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "regression_test_versions")
@Getter @Setter
public class RegressionTestVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regression_test_id", nullable = false)
    private RegressionTest regressionTest;

    @Column(nullable = false)
    private Integer versionNumber;

    @Column(length = 255)
    private String module;

    @Column(length = 255)
    private String feature;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String preconditions;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String testSteps;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String expectedResult;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AutomationStatus automationStatus = AutomationStatus.MANUAL;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private TestStatus status = TestStatus.ACTIVE;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ChangeType changeType = ChangeType.ADDED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Priority           { HIGH, MEDIUM, LOW }
    public enum AutomationStatus   { MANUAL, AUTOMATED, IN_PROGRESS }
    public enum TestStatus         { ACTIVE, DEPRECATED }
    public enum ChangeType         { ADDED, MODIFIED, UNCHANGED }
}
