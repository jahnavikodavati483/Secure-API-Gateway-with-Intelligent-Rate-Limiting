package com.securecloudstorage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class SecureCloudStorageApplication {
    public static void main(String[] args) {
        SpringApplication.run(SecureCloudStorageApplication.class, args);
    }
}
