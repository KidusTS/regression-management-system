package com.regression.regressionpack.entity;

import com.regression.regressiontest.entity.RegressionTestVersion;
import com.regression.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "regression_pack_versions")
@Getter @Setter
public class RegressionPackVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regression_pack_id", nullable = false)
    private RegressionPack regressionPack;

    @Column(nullable = false)
    private Integer versionNumber;

    @Column(length = 100)
    private String label;

    @Column(length = 255)
    private String sourceFileName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> importSummary;

    @Column(nullable = false)
    private boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToMany
    @JoinTable(
        name = "pack_version_tests",
        joinColumns = @JoinColumn(name = "pack_version_id"),
        inverseJoinColumns = @JoinColumn(name = "test_version_id")
    )
    @OrderBy("id ASC")
    private List<RegressionTestVersion> testVersions = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
