package com.regression.attachment.controller;

import com.regression.attachment.dto.AttachmentDto;
import com.regression.attachment.service.AttachmentService;
import com.regression.common.response.ApiResponse;
import com.regression.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/api/results/{resultId}/attachments")
    public ResponseEntity<ApiResponse<AttachmentDto>> upload(
            @PathVariable UUID resultId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(attachmentService.upload(resultId, file, user)));
    }

    @GetMapping("/api/results/{resultId}/attachments")
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> list(@PathVariable UUID resultId) {
        return ResponseEntity.ok(ApiResponse.ok(attachmentService.findByResult(resultId)));
    }

    @DeleteMapping("/api/attachments/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        attachmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Attachment deleted", null));
    }
}
