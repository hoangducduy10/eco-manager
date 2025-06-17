package com.example.ecomanager.services;

import com.example.ecomanager.responses.FileMetadataResponse;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface IFileStorageService {

    Page<FileMetadataResponse> getAllFiles(String fileName, Pageable pageable) throws IOException;

    Optional<FileMetadataResponse> findByFileName(String fileName);

    Resource loadFileByPath(String path) throws IOException;

    FileMetadataResponse getFileById(Long id) throws Exception;

    FileMetadataResponse saveFile(MultipartFile file) throws Exception;

    List<FileMetadataResponse> saveFiles(List<MultipartFile> files) throws Exception;

    FileMetadataResponse savePdfFile(String fileName, byte[] pdfData) throws IOException;

    Resource loadFile(String filename) throws IOException;

    void replaceFile(String oldPath, String newPath, byte[] newContent) throws IOException;

    void deleteFileById(Long fileId) throws Exception;

    void deleteFile(String path);

}
