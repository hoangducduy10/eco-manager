package com.example.ecomanager.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class MeetingDTO {

    @NotBlank(message = "Title is required!")
    private String title;

    @JsonProperty("meeting_date")
    private LocalDate meetingDate;

    private String description;

}
