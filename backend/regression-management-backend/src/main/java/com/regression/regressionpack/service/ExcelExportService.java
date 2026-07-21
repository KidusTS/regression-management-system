package com.regression.regressionpack.service;

import com.regression.regressionpack.entity.RegressionPackVersion;
import com.regression.regressiontest.entity.RegressionTestVersion;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    private static final String[] HEADERS = {
            "Module", "Feature", "Test ID", "Test Title",
            "Preconditions", "Test Steps", "Expected Result",
            "Priority", "Automation Status", "Status"
    };

    public byte[] exportVersion(RegressionPackVersion version) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Regression Tests");

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            List<RegressionTestVersion> tests = version.getTestVersions();
            for (int i = 0; i < tests.size(); i++) {
                RegressionTestVersion tv = tests.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(nullSafe(tv.getModule()));
                row.createCell(1).setCellValue(nullSafe(tv.getFeature()));
                row.createCell(2).setCellValue(tv.getRegressionTest().getTestIdRef());
                row.createCell(3).setCellValue(nullSafe(tv.getTitle()));
                row.createCell(4).setCellValue(nullSafe(tv.getPreconditions()));
                row.createCell(5).setCellValue(nullSafe(tv.getTestSteps()));
                row.createCell(6).setCellValue(nullSafe(tv.getExpectedResult()));
                row.createCell(7).setCellValue(tv.getPriority().name());
                row.createCell(8).setCellValue(tv.getAutomationStatus().name());
                row.createCell(9).setCellValue(tv.getStatus().name());
            }

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel export: " + e.getMessage());
        }
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
