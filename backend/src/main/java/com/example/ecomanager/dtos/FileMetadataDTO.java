package com.example.ecomanager.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FileMetadataDTO {

    @JsonProperty("file_name")
    @NotBlank(message = "File name is required!")
    private String fileName;

    @JsonProperty("tree_path")
    @NotBlank(message = "Tree path is required!")
    private String treePath;

    private String version;

    private String status;

}
