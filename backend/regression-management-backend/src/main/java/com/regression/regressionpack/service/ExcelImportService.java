package com.regression.regressionpack.service;

import com.regression.common.exception.ImportException;
import com.regression.regressionpack.dto.ExcelRowDto;
import com.regression.regressionpack.dto.ImportResultDto;
import com.regression.regressionpack.entity.RegressionPack;
import com.regression.regressionpack.entity.RegressionPackVersion;
import com.regression.regressionpack.repository.RegressionPackVersionRepository;
import com.regression.regressiontest.entity.RegressionTest;
import com.regression.regressiontest.entity.RegressionTestVersion;
import com.regression.regressiontest.entity.RegressionTestVersion.*;
import com.regression.regressiontest.repository.RegressionTestRepository;
import com.regression.regressiontest.repository.RegressionTestVersionRepository;
import com.regression.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final RegressionPackVersionRepository packVersionRepository;
    private final RegressionTestRepository testRepository;
    private final RegressionTestVersionRepository testVersionRepository;

    private static final Map<String, String> HEADER_ALIASES = Map.ofEntries(
            Map.entry("module",            "module"),
            Map.entry("feature",           "feature"),
            Map.entry("test id",           "testIdRef"),
            Map.entry("test title",        "title"),
            Map.entry("title",             "title"),
            Map.entry("preconditions",     "preconditions"),
            Map.entry("test steps",        "testSteps"),
            Map.entry("expected result",   "expectedResult"),
            Map.entry("priority",          "priority"),
            Map.entry("automation status", "automationStatus"),
            Map.entry("status",            "status")
    );

    @Transactional
    public ImportResultDto importExcel(RegressionPack pack, MultipartFile file, User importedBy) {
        List<ExcelRowDto> rows = parseExcel(file);
        validateRows(rows);

        Optional<RegressionPackVersion> latestVersionOpt =
                packVersionRepository.findTopByRegressionPackIdOrderByVersionNumberDesc(pack.getId());

        Map<String, RegressionTestVersion> currentVersionMap = buildCurrentVersionMap(latestVersionOpt);

        int added = 0, modified = 0, unchanged = 0, removed;

        RegressionPackVersion newVersion = new RegressionPackVersion();
        newVersion.setRegressionPack(pack);
        newVersion.setVersionNumber(latestVersionOpt.map(v -> v.getVersionNumber() + 1).orElse(1));
        newVersion.setSourceFileName(file.getOriginalFilename());
        newVersion.setCreatedBy(importedBy);

        List<RegressionTestVersion> newTestVersions = new ArrayList<>();
        Set<String> processedIds = new HashSet<>();

        for (ExcelRowDto row : rows) {
            processedIds.add(row.getTestIdRef());
            RegressionTestVersion existing = currentVersionMap.get(row.getTestIdRef());

            if (existing == null) {
                // New test
                RegressionTest test = testRepository
                        .findByRegressionPackIdAndTestIdRef(pack.getId(), row.getTestIdRef())
                        .orElseGet(() -> createTest(pack, row.getTestIdRef()));

                RegressionTestVersion tv = createTestVersion(test, row, 1, ChangeType.ADDED);
                newTestVersions.add(tv);
                added++;
            } else if (hasChanged(existing, row)) {
                // Modified test — create new version
                RegressionTestVersion tv = createTestVersion(
                        existing.getRegressionTest(), row,
                        existing.getVersionNumber() + 1, ChangeType.MODIFIED);
                newTestVersions.add(tv);
                modified++;
            } else {
                // Unchanged — reuse existing version
                newTestVersions.add(existing);
                unchanged++;
            }
        }

        removed = (int) currentVersionMap.keySet().stream()
                .filter(id -> !processedIds.contains(id))
                .count();

        newVersion.setImportSummary(Map.of(
                "added", added,
                "modified", modified,
                "unchanged", unchanged,
                "removed", removed
        ));
        newVersion.setTestVersions(newTestVersions);
        packVersionRepository.save(newVersion);

        return ImportResultDto.builder()
                .newVersionId(newVersion.getId())
                .versionNumber(newVersion.getVersionNumber())
                .added(added)
                .modified(modified)
                .unchanged(unchanged)
                .removed(removed)
                .total(newTestVersions.size())
                .build();
    }

    private List<ExcelRowDto> parseExcel(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() <= 1) {
                throw new ImportException("Excel sheet is empty or contains only headers");
            }

            // Build header index map from first row
            Row headerRow = sheet.getRow(0);
            Map<String, Integer> colIndex = new HashMap<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                if (cell == null) continue;
                String raw = cell.getStringCellValue().trim().toLowerCase();
                String field = HEADER_ALIASES.get(raw);
                if (field != null) colIndex.put(field, i);
            }

            List<ExcelRowDto> rows = new ArrayList<>();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                rows.add(ExcelRowDto.builder()
                        .module(col(row, colIndex, "module"))
                        .feature(col(row, colIndex, "feature"))
                        .testIdRef(col(row, colIndex, "testIdRef"))
                        .title(col(row, colIndex, "title"))
                        .preconditions(col(row, colIndex, "preconditions"))
                        .testSteps(col(row, colIndex, "testSteps"))
                        .expectedResult(col(row, colIndex, "expectedResult"))
                        .priority(col(row, colIndex, "priority"))
                        .automationStatus(col(row, colIndex, "automationStatus"))
                        .status(col(row, colIndex, "status"))
                        .build());
            }
            return rows;
        } catch (IOException e) {
            throw new ImportException("Failed to read Excel file: " + e.getMessage());
        }
    }

    private String col(Row row, Map<String, Integer> colIndex, String field) {
        Integer idx = colIndex.get(field);
        if (idx == null) return null;
        return cellValue(row, idx);
    }

    private void validateRows(List<ExcelRowDto> rows) {
        List<String> errors = new ArrayList<>();
        Set<String> seenIds = new HashSet<>();

        for (int i = 0; i < rows.size(); i++) {
            ExcelRowDto row = rows.get(i);
            int lineNum = i + 2;

            if (isBlank(row.getTestIdRef()))      errors.add("Row " + lineNum + ": Test ID is required");
            if (isBlank(row.getTitle()))           errors.add("Row " + lineNum + ": Title is required");
            if (isBlank(row.getTestSteps()))       errors.add("Row " + lineNum + ": Test Steps are required");
            if (isBlank(row.getExpectedResult()))  errors.add("Row " + lineNum + ": Expected Result is required");

            if (!isBlank(row.getTestIdRef())) {
                if (!seenIds.add(row.getTestIdRef())) {
                    errors.add("Row " + lineNum + ": Duplicate Test ID '" + row.getTestIdRef() + "'");
                }
            }
        }

        if (!errors.isEmpty()) throw new ImportException("Excel validation failed", errors);
    }

    private Map<String, RegressionTestVersion> buildCurrentVersionMap(Optional<RegressionPackVersion> latestOpt) {
        if (latestOpt.isEmpty()) return Collections.emptyMap();
        Map<String, RegressionTestVersion> map = new HashMap<>();
        for (RegressionTestVersion tv : latestOpt.get().getTestVersions()) {
            map.put(tv.getRegressionTest().getTestIdRef(), tv);
        }
        return map;
    }

    private RegressionTest createTest(RegressionPack pack, String testIdRef) {
        RegressionTest test = new RegressionTest();
        test.setRegressionPack(pack);
        test.setTestIdRef(testIdRef);
        return testRepository.save(test);
    }

    private RegressionTestVersion createTestVersion(RegressionTest test, ExcelRowDto row,
                                                     int versionNumber, ChangeType changeType) {
        RegressionTestVersion tv = new RegressionTestVersion();
        tv.setRegressionTest(test);
        tv.setVersionNumber(versionNumber);
        tv.setModule(row.getModule());
        tv.setFeature(row.getFeature());
        tv.setTitle(row.getTitle());
        tv.setPreconditions(row.getPreconditions());
        tv.setTestSteps(row.getTestSteps());
        tv.setExpectedResult(row.getExpectedResult());
        tv.setPriority(parsePriority(row.getPriority()));
        tv.setAutomationStatus(parseAutomationStatus(row.getAutomationStatus()));
        tv.setStatus(parseTestStatus(row.getStatus()));
        tv.setChangeType(changeType);
        return testVersionRepository.save(tv);
    }

    private boolean hasChanged(RegressionTestVersion existing, ExcelRowDto row) {
        return !Objects.equals(existing.getModule(), row.getModule())
                || !Objects.equals(existing.getFeature(), row.getFeature())
                || !Objects.equals(existing.getTitle(), row.getTitle())
                || !Objects.equals(existing.getPreconditions(), row.getPreconditions())
                || !Objects.equals(existing.getTestSteps(), row.getTestSteps())
                || !Objects.equals(existing.getExpectedResult(), row.getExpectedResult())
                || existing.getPriority() != parsePriority(row.getPriority())
                || existing.getAutomationStatus() != parseAutomationStatus(row.getAutomationStatus())
                || existing.getStatus() != parseTestStatus(row.getStatus());
    }

    private Priority parsePriority(String value) {
        try { return Priority.valueOf(value.toUpperCase()); }
        catch (Exception e) { return Priority.MEDIUM; }
    }

    private AutomationStatus parseAutomationStatus(String value) {
        try { return AutomationStatus.valueOf(value.toUpperCase()); }
        catch (Exception e) { return AutomationStatus.MANUAL; }
    }

    private TestStatus parseTestStatus(String value) {
        try { return TestStatus.valueOf(value.toUpperCase()); }
        catch (Exception e) { return TestStatus.ACTIVE; }
    }

    private String cellValue(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> null;
        };
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
