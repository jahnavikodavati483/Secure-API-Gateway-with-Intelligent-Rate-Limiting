package com.securecloudstorage.repository;

import com.securecloudstorage.model.FileMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FileRepository extends MongoRepository<FileMetadata, String> {
    List<FileMetadata> findByUserIdOrderByCreatedAtDesc(String userId);
}
