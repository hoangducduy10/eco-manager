package com.example.ecomanager.services.impl;

import com.example.ecomanager.services.IFileStorageService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FileStorageService implements IFileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() throws IOException {
        rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        if(!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }
        System.out.println("Root upload directory: " + rootLocation.toAbsolutePath());
    }

    @Override
    public List<String> getAllFiles() throws IOException {
       try(Stream<Path> paths = Files.walk(rootLocation, 1)) {
           return paths
                   .filter(path -> !path.equals(rootLocation))
                   .map(rootLocation::relativize)
                   .map(Path::toString)
                   .collect(Collectors.toList());
       }
    }

    @Override
    public void saveFile(MultipartFile file) throws Exception {
        if(file.isEmpty()){
            throw new IOException("Cannot store empty file " + file.getOriginalFilename());
        }

        Path target = rootLocation.resolve(Objects.requireNonNull(file.getOriginalFilename()));
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
    }

    @Override
    public void saveFiles(List<MultipartFile> files) throws Exception {
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                saveFile(file);
            }
        }
    }

    @Override
    public void savePdfFile(String fileName, byte[] pdfData) throws IOException {
        Path target = rootLocation.resolve(fileName);
        Files.write(target, pdfData);
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
    public void deleteFile(String filename) throws IOException {
        System.out.println("Deleting file: " + filename);
        Path filePath = rootLocation.resolve(filename);
        Files.deleteIfExists(filePath);
    }
}
