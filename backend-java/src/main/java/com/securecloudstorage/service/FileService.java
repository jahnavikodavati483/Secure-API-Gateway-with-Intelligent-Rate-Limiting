package com.securecloudstorage.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.securecloudstorage.model.FileMetadata;
import com.securecloudstorage.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final Cloudinary cloudinary;

    public FileMetadata uploadFile(MultipartFile file, String originalName,
                                   String encryptedAesKey, String userId) throws IOException {
        // Upload encrypted file to Cloudinary
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("resource_type", "raw", "folder", "secure-cloud-uploads")
        );

        FileMetadata metadata = new FileMetadata();
        metadata.setUserId(userId);
        metadata.setOriginalName(originalName);
        metadata.setFileName((String) uploadResult.get("public_id"));
        metadata.setMimeType(file.getContentType());
        metadata.setSize(file.getSize());
        metadata.setEncryptedAesKey(encryptedAesKey);
        metadata.setCloudinaryUrl((String) uploadResult.get("secure_url"));

        return fileRepository.save(metadata);
    }

    public List<FileMetadata> getUserFiles(String userId) {
        return fileRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public FileMetadata getFileById(String id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
    }

    public byte[] downloadFile(String cloudinaryUrl) throws IOException {
        URL url = new URL(cloudinaryUrl);
        try (InputStream in = url.openStream()) {
            return in.readAllBytes();
        }
    }

    public void deleteFile(String id) throws Exception {
        FileMetadata fileMeta = getFileById(id);
        if (fileMeta.getFileName() != null) {
            cloudinary.uploader().destroy(fileMeta.getFileName(),
                    ObjectUtils.asMap("resource_type", "raw"));
        }
        fileRepository.deleteById(id);
    }
}
