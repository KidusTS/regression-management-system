package com.regression.util;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.*;

import java.io.ByteArrayOutputStream;

public class ExcelTestHelper {

    /**
     * Columns: Module | Feature | TestID | Title | Preconditions | Steps | Expected | Priority | Automation | Status
     */
    public static byte[] buildValidExcel(String[][] dataRows) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Tests");

            // Header row
            Row header = sheet.createRow(0);
            String[] headers = {"Module", "Feature", "Test ID", "Title", "Preconditions",
                    "Test Steps", "Expected Result", "Priority", "Automation Status", "Status"};
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }

            // Data rows
            for (int r = 0; r < dataRows.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < dataRows[r].length; c++) {
                    row.createCell(c).setCellValue(dataRows[r][c]);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        }
    }

    public static String[][] sampleRows() {
        return new String[][]{
                {"Login", "Authentication", "TC-001", "Valid login", "User exists", "Enter credentials", "Dashboard shown", "HIGH", "MANUAL", "ACTIVE"},
                {"Login", "Authentication", "TC-002", "Invalid password", "User exists", "Enter wrong password", "Error shown", "HIGH", "MANUAL", "ACTIVE"},
                {"Dashboard", "Overview", "TC-003", "Load dashboard", "", "Navigate to dashboard", "Stats visible", "MEDIUM", "MANUAL", "ACTIVE"},
        };
    }
}
