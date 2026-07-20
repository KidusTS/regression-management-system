package com.regression.regressiontest.entity;

import com.regression.regressionpack.entity.RegressionPack;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "regression_tests")
@Getter @Setter
public class RegressionTest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regression_pack_id", nullable = false)
    private RegressionPack regressionPack;

    @Column(nullable = false, length = 100)
    private String testIdRef;

    @OneToMany(mappedBy = "regressionTest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("versionNumber ASC")
    private List<RegressionTestVersion> versions = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
