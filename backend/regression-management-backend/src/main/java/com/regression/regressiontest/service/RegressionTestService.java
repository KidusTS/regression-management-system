package com.regression.regressiontest.service;

import com.regression.common.exception.ResourceNotFoundException;
import com.regression.regressionpack.entity.RegressionPackVersion;
import com.regression.regressionpack.repository.RegressionPackVersionRepository;
import com.regression.regressiontest.dto.RegressionTestVersionDto;
import com.regression.regressiontest.entity.RegressionTestVersion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegressionTestService {

    private final RegressionPackVersionRepository packVersionRepository;

    public List<RegressionTestVersionDto> findTestsInVersion(UUID packId, UUID versionId) {
        RegressionPackVersion version = packVersionRepository.findById(versionId)
                .filter(v -> v.getRegressionPack().getId().equals(packId))
                .orElseThrow(() -> new ResourceNotFoundException("Version not found"));

        return version.getTestVersions().stream().map(this::toDto).toList();
    }

    private RegressionTestVersionDto toDto(RegressionTestVersion tv) {
        RegressionTestVersionDto dto = new RegressionTestVersionDto();
        dto.setId(tv.getId());
        dto.setRegressionTestId(tv.getRegressionTest().getId());
        dto.setTestIdRef(tv.getRegressionTest().getTestIdRef());
        dto.setVersionNumber(tv.getVersionNumber());
        dto.setModule(tv.getModule());
        dto.setFeature(tv.getFeature());
        dto.setTitle(tv.getTitle());
        dto.setPreconditions(tv.getPreconditions());
        dto.setTestSteps(tv.getTestSteps());
        dto.setExpectedResult(tv.getExpectedResult());
        dto.setPriority(tv.getPriority().name());
        dto.setAutomationStatus(tv.getAutomationStatus().name());
        dto.setStatus(tv.getStatus().name());
        dto.setChangeType(tv.getChangeType().name());
        dto.setCreatedAt(tv.getCreatedAt());
        return dto;
    }
}
