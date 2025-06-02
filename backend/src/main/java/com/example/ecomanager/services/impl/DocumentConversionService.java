package com.example.ecomanager.services.impl;

import com.example.ecomanager.services.IDocumnetConversionService;
import com.example.ecomanager.services.IFileStorageService;
import lombok.RequiredArgsConstructor;
import org.docx4j.Docx4J;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class DocumentConversionService implements IDocumnetConversionService {

    private final IFileStorageService fileStorageService;

    @Override
    public byte[] convertDocxToPdf(String docxFileName) throws Exception {
        if (!docxFileName.toLowerCase().endsWith(".docx")) {
            throw new IllegalArgumentException("Only DOCX files are supported for conversion");
        }

        // Load DOCX file
        Resource docxResource = fileStorageService.loadFile(docxFileName);

        try (InputStream docxInputStream = docxResource.getInputStream();
             ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream()) {

            // Load WordprocessingMLPackage from InputStream
            WordprocessingMLPackage wordPackage = WordprocessingMLPackage.load(docxInputStream);

            // Convert to PDF
            Docx4J.toPDF(wordPackage, pdfOutputStream);

            return pdfOutputStream.toByteArray();

        } catch (Exception e) {
            throw new Exception("Failed to convert DOCX to PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public String convertAndSavePdf(String docxFileName) throws Exception {
        byte[] pdfBytes = convertDocxToPdf(docxFileName);

        // Generate PDF filename
        String pdfFileName = docxFileName.replaceAll("\\.docx$", ".pdf");

        fileStorageService.savePdfFile(pdfFileName, pdfBytes);
        return pdfFileName;
    }

}
