package com.example.ecomanager.responses;

import com.example.ecomanager.models.FileMetadata;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FileMetadataResponse {

    private Long id;

    @JsonProperty("file_name")
    private String fileName;

    @JsonProperty("tree_path")
    private String treePath;

    private String version;

    private String status;

    public static FileMetadataResponse fromFileMetadata(FileMetadata fileMetadata) {
        return FileMetadataResponse.builder()
                .id(fileMetadata.getId())
                .fileName(fileMetadata.getFileName())
                .treePath(fileMetadata.getTreePath())
                .version(fileMetadata.getVersion())
                .status(fileMetadata.getStatus())
                .build();
    }
}
