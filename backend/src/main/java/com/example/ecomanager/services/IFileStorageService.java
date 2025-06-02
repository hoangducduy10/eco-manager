package com.example.ecomanager.services;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IFileStorageService {

    List<String> getAllFiles() throws IOException;

    void saveFile(MultipartFile file) throws Exception;

    void saveFiles(List<MultipartFile> files) throws Exception;

    void savePdfFile(String fileName, byte[] pdfData) throws IOException;

    Resource loadFile(String filename) throws IOException;

    void deleteFile(String filename) throws IOException;

}
