package com.securecloudstorage.controller;

import com.securecloudstorage.model.FileMetadata;
import com.securecloudstorage.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    // POST /api/files/upload
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("originalName") String originalName,
            @RequestParam("encryptedAesKey") String encryptedAesKey,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            FileMetadata saved = fileService.uploadFile(file, originalName, encryptedAesKey, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error during upload"));
        }
    }

    // GET /api/files
    @GetMapping
    public ResponseEntity<List<FileMetadata>> getUserFiles(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(fileService.getUserFiles(userId));
    }

    // GET /api/files/:id
    @GetMapping("/{id}")
    public ResponseEntity<?> getFile(@PathVariable String id, Authentication authentication) {
        try {
            FileMetadata file = fileService.getFileById(id);
            if (!file.getUserId().equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }
            return ResponseEntity.ok(file);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "File not found"));
        }
    }

    // GET /api/files/:id/download
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadFile(@PathVariable String id, Authentication authentication) {
        try {
            FileMetadata fileMeta = fileService.getFileById(id);
            if (!fileMeta.getUserId().equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }
            byte[] fileBytes = fileService.downloadFile(fileMeta.getCloudinaryUrl());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileMeta.getOriginalName() + "\"")
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(new String(fileBytes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error during file download"));
        }
    }

    // DELETE /api/files/:id
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id, Authentication authentication) {
        try {
            FileMetadata fileMeta = fileService.getFileById(id);
            if (!fileMeta.getUserId().equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }
            fileService.deleteFile(id);
            return ResponseEntity.ok(Map.of("msg", "File deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error deleting file"));
        }
    }
}
