package com.regression.regressionpack.service;

import com.regression.common.exception.ResourceNotFoundException;
import com.regression.regressionpack.dto.*;
import com.regression.regressionpack.entity.RegressionPack;
import com.regression.regressionpack.entity.RegressionPackVersion;
import com.regression.regressionpack.repository.RegressionPackRepository;
import com.regression.regressionpack.repository.RegressionPackVersionRepository;
import com.regression.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegressionPackService {

    private final RegressionPackRepository packRepository;
    private final RegressionPackVersionRepository versionRepository;
    private final ExcelImportService excelImportService;

    @Transactional(readOnly = true)
    public List<RegressionPackDto> findAll() {
        return packRepository.findAllByIsActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public RegressionPackDto findById(UUID id) {
        return toDto(getPackOrThrow(id));
    }

    @Transactional
    public RegressionPackDto create(CreateRegressionPackRequest request, User createdBy) {
        RegressionPack pack = new RegressionPack();
        pack.setName(request.getName());
        pack.setDescription(request.getDescription());
        pack.setProject(request.getProject());
        pack.setCreatedBy(createdBy);
        return toDto(packRepository.save(pack));
    }

    @Transactional
    public RegressionPackDto update(UUID id, CreateRegressionPackRequest request) {
        RegressionPack pack = getPackOrThrow(id);
        pack.setName(request.getName());
        pack.setDescription(request.getDescription());
        pack.setProject(request.getProject());
        return toDto(packRepository.save(pack));
    }

    @Transactional
    public void softDelete(UUID id) {
        RegressionPack pack = getPackOrThrow(id);
        pack.setActive(false);
        packRepository.save(pack);
    }

    @Transactional(readOnly = true)
    public List<RegressionPackVersionDto> findVersions(UUID packId) {
        getPackOrThrow(packId);
        return versionRepository.findAllByRegressionPackIdOrderByVersionNumberAsc(packId)
                .stream().map(this::toVersionDto).toList();
    }

    @Transactional(readOnly = true)
    public RegressionPackVersionDto findVersion(UUID packId, UUID versionId) {
        RegressionPackVersion version = versionRepository.findById(versionId)
                .filter(v -> v.getRegressionPack().getId().equals(packId))
                .orElseThrow(() -> new ResourceNotFoundException("Version not found"));
        return toVersionDto(version);
    }

    @Transactional
    public ImportResultDto importExcel(UUID packId, MultipartFile file, User importedBy) {
        RegressionPack pack = getPackOrThrow(packId);
        return excelImportService.importExcel(pack, file, importedBy);
    }

    private RegressionPack getPackOrThrow(UUID id) {
        return packRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regression pack not found: " + id));
    }

    private RegressionPackDto toDto(RegressionPack pack) {
        RegressionPackDto dto = new RegressionPackDto();
        dto.setId(pack.getId());
        dto.setName(pack.getName());
        dto.setDescription(pack.getDescription());
        dto.setProject(pack.getProject());
        dto.setActive(pack.isActive());
        dto.setVersionCount(pack.getVersions().size());
        dto.setCreatedAt(pack.getCreatedAt());
        dto.setUpdatedAt(pack.getUpdatedAt());
        return dto;
    }

    private RegressionPackVersionDto toVersionDto(RegressionPackVersion v) {
        RegressionPackVersionDto dto = new RegressionPackVersionDto();
        dto.setId(v.getId());
        dto.setRegressionPackId(v.getRegressionPack().getId());
        dto.setVersionNumber(v.getVersionNumber());
        dto.setLabel(v.getLabel());
        dto.setSourceFileName(v.getSourceFileName());
        dto.setImportSummary(v.getImportSummary());
        dto.setTestCount(v.getTestVersions().size());
        dto.setCreatedAt(v.getCreatedAt());
        return dto;
    }
}
