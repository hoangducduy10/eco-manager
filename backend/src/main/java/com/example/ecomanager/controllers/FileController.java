package com.example.ecomanager.controllers;

import com.example.ecomanager.responses.BaseListResponse;
import com.example.ecomanager.responses.FileMetadataResponse;
import com.example.ecomanager.services.IDocumnetConversionService;
import com.example.ecomanager.services.IFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/" + "${api.prefix}" + "/files")
@RequiredArgsConstructor
public class FileController {

    private final IFileStorageService fileService;
    private final IDocumnetConversionService conversionService;

    @GetMapping
    public ResponseEntity<BaseListResponse<FileMetadataResponse>> getAllFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String fileName
    ) throws IOException {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<FileMetadataResponse> filePage = fileService.getAllFiles(fileName, pageRequest);
        List<FileMetadataResponse> fileList = filePage.getContent();

        return ResponseEntity.ok(BaseListResponse.<FileMetadataResponse>builder()
                .items(fileList)
                .totalPages(filePage.getTotalPages())
                .build());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            fileService.saveFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("message", "File uploaded successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    @PostMapping("/upload/multiple")
    public ResponseEntity<?> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files
    ) {
        try {
            fileService.saveFiles(files);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Files uploaded successfully. Count: " + files.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload files: " + e.getMessage());
        }
    }

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) throws IOException {
        Optional<FileMetadataResponse> fileMeta = fileService.findByFileName(fileName);
        if (fileMeta.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FileMetadataResponse metadata = fileMeta.get();

        Resource resource = fileService.loadFileByPath(metadata.getTreePath());

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
    public ResponseEntity<?> deleteFile(
            @PathVariable String fileName
    ) throws Exception {
        try {
            fileService.deleteFile(fileName);
            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to delete file: " + e.getMessage());
        }
    }

}
