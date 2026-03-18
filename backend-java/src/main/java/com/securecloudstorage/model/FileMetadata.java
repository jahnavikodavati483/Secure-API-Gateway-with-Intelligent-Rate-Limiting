package com.securecloudstorage.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "files")
public class FileMetadata {

    @Id
    private String id;

    private String userId;

    private String originalName;

    private String fileName;

    private String mimeType;

    private long size;

    private String encryptedAesKey;

    private String cloudinaryUrl;

    @CreatedDate
    private Instant createdAt;
}
