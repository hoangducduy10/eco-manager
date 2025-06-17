package com.example.ecomanager.services.impl;

import com.example.ecomanager.models.FileMetadata;
import com.example.ecomanager.repositories.FileMetadataRepository;
import com.example.ecomanager.services.IDocumnetConversionService;
import com.example.ecomanager.services.IFileStorageService;
import lombok.RequiredArgsConstructor;
import org.docx4j.Docx4J;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class DocumentConversionService implements IDocumnetConversionService {

    private final IFileStorageService fileStorageService;
    private final FileMetadataRepository fileMetadataRepository;

    @Override
    public byte[] convertDocxToPdf(Long fileId) throws Exception {
        FileMetadata metadata = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found with ID: " + fileId));

        if (!metadata.getFileName().toLowerCase().endsWith(".docx")) {
            throw new IllegalArgumentException("Only DOCX files are supported for conversion");
        }

        Resource docxResource = fileStorageService.loadFileByPath(metadata.getTreePath());

        try (InputStream docxInputStream = docxResource.getInputStream();
             ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream()) {

            WordprocessingMLPackage wordPackage = WordprocessingMLPackage.load(docxInputStream);
            Docx4J.toPDF(wordPackage, pdfOutputStream);

            return pdfOutputStream.toByteArray();

        } catch (Exception e) {
            throw new Exception("Failed to convert DOCX to PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public String convertAndSavePdf(Long fileId) throws Exception {
        byte[] pdfBytes = convertDocxToPdf(fileId);

        FileMetadata metadata = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found with ID: " + fileId));

        String oldPath = metadata.getTreePath();
        Path oldPathObj = Paths.get(oldPath);
        String originalFileName = oldPathObj.getFileName().toString();

        String pdfFileName = originalFileName.replaceAll("\\.docx$", ".pdf");

        Path newPathObj = oldPathObj.getParent().resolve(pdfFileName);
        String newPath = newPathObj.toString();

        fileStorageService.replaceFile(oldPath, newPath, pdfBytes);

        metadata.setFileName(metadata.getFileName().replaceAll("\\.docx$", ".pdf"));
        metadata.setTreePath(newPath);
        fileMetadataRepository.save(metadata);

        return metadata.getFileName();
    }


}
