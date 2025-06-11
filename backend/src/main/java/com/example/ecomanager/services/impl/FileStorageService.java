package com.example.ecomanager.services.impl;

import com.example.ecomanager.exceptions.DataNotFoundException;
import com.example.ecomanager.models.FileMetadata;
import com.example.ecomanager.repositories.FileMetadataRepository;
import com.example.ecomanager.responses.FileMetadataResponse;
import com.example.ecomanager.services.IFileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService implements IFileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    private final FileMetadataRepository fileMetadataRepository;

    @PostConstruct
    public void init() throws IOException {
        rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        if(!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }
    }

    @Override
    public Page<FileMetadataResponse> getAllFiles(String fileName, Pageable pageable) throws IOException {
       Page<FileMetadata> page = fileMetadataRepository.getAllByFileName(fileName, pageable);
       return page.map(FileMetadataResponse::fromFileMetadata);
    }

    @Override
    public FileMetadataResponse getFileById(Long id) throws Exception {
        FileMetadata metadata = fileMetadataRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("File not found with id: " + id));
        return FileMetadataResponse.fromFileMetadata(metadata);
    }

    @Override
    public Optional<FileMetadataResponse> findByFileName(String fileName) {
        return fileMetadataRepository.findByFileName(fileName)
                .map(FileMetadataResponse::fromFileMetadata);
    }

    @Override
    public Resource loadFileByPath(String path) throws IOException {
        Path filePath = Paths.get(path).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("File not found: " + path);
        }
    }

    @Override
    public FileMetadataResponse saveFile(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new IOException("Cannot store empty file " + file.getOriginalFilename());
        }

        String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + "-" + originalFilename;
        Path target = rootLocation.resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        FileMetadata metadata = FileMetadata.builder()
                .fileName(originalFilename)
                .treePath(target.toString())
                .version("V1")
                .status("ACTIVE")
                .build();

        return FileMetadataResponse.fromFileMetadata(fileMetadataRepository.save(metadata));
    }

    @Override
    public List<FileMetadataResponse> saveFiles(List<MultipartFile> files) throws Exception {
        List<FileMetadataResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                responses.add(saveFile(file));
            }
        }

        return responses;
    }

    @Override
    public FileMetadataResponse savePdfFile(String fileName, byte[] pdfData) throws IOException {
        String storedName = UUID.randomUUID() + "-" + fileName;
        Path target = rootLocation.resolve(storedName);
        Files.write(target, pdfData);

        FileMetadata metadata = FileMetadata.builder()
                .fileName(fileName)
                .treePath(target.toString())
                .version("V1")
                .status("ACTIVE")
                .build();

        FileMetadata saved = fileMetadataRepository.save(metadata);
        return FileMetadataResponse.fromFileMetadata(saved);
    }

    @Override
    public Resource loadFile(String filename) throws IOException {
        Path filePath = rootLocation.resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("Could not read file: " + filename);
        }
    }

    @Override
    public void deleteFile(String filename) throws Exception {
        FileMetadata metadata = fileMetadataRepository.findByFileName(filename)
                .orElseThrow(() -> new DataNotFoundException("File not found: " + filename));

        Path filePath = Paths.get(metadata.getTreePath());

        Files.deleteIfExists(filePath);
        fileMetadataRepository.delete(metadata);
    }
}
