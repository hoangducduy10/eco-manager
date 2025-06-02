package com.example.ecomanager.controllers;

import com.example.ecomanager.services.IDocumnetConversionService;
import com.example.ecomanager.services.IFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/" + "${api.prefix}" + "/files")
@RequiredArgsConstructor
public class FileController {

    private final IFileStorageService fileService;
    private final IDocumnetConversionService conversionService;

    @GetMapping
    public ResponseEntity<List<String>> getAllFiles() throws IOException {
        return ResponseEntity.ok(fileService.getAllFiles());
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            fileService.saveFile(file);
            return ResponseEntity.ok("File uploaded successfully: " + file.getOriginalFilename());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    @PostMapping("/upload/multiple")
    public ResponseEntity<String> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files
    ) {
        try {
            fileService.saveFiles(files);
            return ResponseEntity.ok("Files uploaded successfully. Count: " + files.size());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload files: " + e.getMessage());
        }
    }

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) throws IOException {
        Resource resource = fileService.loadFile(fileName);

        String contentType = Files.probeContentType(Paths.get(fileName));
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header("Content-Disposition", "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PostMapping("/convert-to-pdf/{fileName}")
    public ResponseEntity<byte[]> convertDocxToPdf(@PathVariable String fileName) {
        try {
            if (!fileName.toLowerCase().endsWith(".docx")) {
                return ResponseEntity.badRequest()
                        .body("Only DOCX files can be converted to PDF".getBytes());
            }

            byte[] pdfBytes = conversionService.convertDocxToPdf(fileName);
            String pdfFileName = fileName.replaceAll("\\.docx$", ".pdf");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + pdfFileName + "\"")
                    .body(pdfBytes);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(("Failed to convert file: " + e.getMessage()).getBytes());
        }
    }

    @PostMapping("/convert-and-save/{fileName}")
    public ResponseEntity<String> convertAndSavePdf(@PathVariable String fileName) {
        try {
            if (!fileName.toLowerCase().endsWith(".docx")) {
                return ResponseEntity.badRequest()
                        .body("Only DOCX files can be converted to PDF");
            }

            String pdfFileName = conversionService.convertAndSavePdf(fileName);
            return ResponseEntity.ok("File converted and saved successfully: " + pdfFileName);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Failed to convert file: " + e.getMessage());
        }
    }

    @DeleteMapping("/{fileName}")
    public ResponseEntity<String> deleteFile(
            @PathVariable String fileName
    ) {
        try {
            fileService.deleteFile(fileName);
            return ResponseEntity.ok("File deleted successfully: " + fileName);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to delete file: " + e.getMessage());
        }
    }

}
