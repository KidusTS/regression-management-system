package com.regression.attachment.service;

import com.regression.attachment.dto.AttachmentDto;
import com.regression.attachment.entity.Attachment;
import com.regression.attachment.repository.AttachmentRepository;
import com.regression.common.exception.ResourceNotFoundException;
import com.regression.regressionsession.entity.RegressionExecutionResult;
import com.regression.regressionsession.repository.RegressionExecutionResultRepository;
import com.regression.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private static final String UPLOAD_DIR = "uploads/attachments";

    private final AttachmentRepository attachmentRepository;
    private final RegressionExecutionResultRepository resultRepository;

    @Transactional
    public AttachmentDto upload(UUID resultId, MultipartFile file, User uploadedBy) {
        RegressionExecutionResult result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution result not found: " + resultId));

        // Never use the client-supplied name on disk (path traversal). Keep only a safe extension.
        String storedName = UUID.randomUUID() + safeExtension(file.getOriginalFilename());
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        Path target = uploadPath.resolve(storedName).normalize();
        if (!target.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Invalid file name");
        }

        try {
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), target);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }

        Attachment attachment = new Attachment();
        attachment.setExecutionResult(result);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(target.toString());
        attachment.setFileSize(file.getSize());
        attachment.setMimeType(file.getContentType());
        attachment.setUploadedBy(uploadedBy);

        return toDto(attachmentRepository.save(attachment));
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> findByResult(UUID resultId) {
        return attachmentRepository.findAllByExecutionResultId(resultId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public void delete(UUID id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + id));
        try {
            Files.deleteIfExists(Paths.get(attachment.getFilePath()));
        } catch (IOException ignored) {}
        attachmentRepository.delete(attachment);
    }

    private static String safeExtension(String originalName) {
        if (originalName == null) return "";
        int dot = originalName.lastIndexOf('.');
        if (dot < 0) return "";
        String ext = originalName.substring(dot).toLowerCase();
        return ext.matches("\\.[a-z0-9]{1,10}") ? ext : "";
    }

    private AttachmentDto toDto(Attachment a) {
        AttachmentDto dto = new AttachmentDto();
        dto.setId(a.getId());
        dto.setExecutionResultId(a.getExecutionResult().getId());
        dto.setFileName(a.getFileName());
        dto.setFileSize(a.getFileSize());
        dto.setMimeType(a.getMimeType());
        dto.setUploadedAt(a.getUploadedAt());
        return dto;
    }
}
