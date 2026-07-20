package com.regression.attachment.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class AttachmentDto {
    private UUID id;
    private UUID executionResultId;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private LocalDateTime uploadedAt;
}
