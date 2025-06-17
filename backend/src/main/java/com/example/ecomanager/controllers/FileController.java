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

    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> getFile(@PathVariable Long fileId) throws IOException {
        try {
            FileMetadataResponse metadata = fileService.getFileById(fileId);

            Resource resource = fileService.loadFileByPath(metadata.getTreePath());

            String contentType = Files.probeContentType(Paths.get(metadata.getTreePath()));
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("Content-Disposition", "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/convert-to-pdf/{fileId}")
    public ResponseEntity<?> convertDocxToPdf(@PathVariable Long fileId) {
        try {
            conversionService.convertDocxToPdf(fileId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to convert file: " + e.getMessage());
        }
    }

    @PostMapping("/convert-and-save/{fileId}")
    public ResponseEntity<Map<String, String>> convertAndSavePdf(@PathVariable Long fileId) {
        try {
            String pdfFileName = conversionService.convertAndSavePdf(fileId);
            return ResponseEntity.ok(Map.of("message", "File converted and saved successfully", "fileName", pdfFileName));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to convert file: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFileById(@PathVariable Long fileId) {
        try {
            fileService.deleteFileById(fileId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete file: " + e.getMessage());
        }
    }


}
