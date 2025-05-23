package com.example.ecomanager.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class ScoreDTO {

    private Long employeeId;

    private Long meetingId;

    @NotNull(message = "Score is required!")
    @Min(value = 0, message = "Score must be non-negative!")
    private int score;

    private String comment;

}
