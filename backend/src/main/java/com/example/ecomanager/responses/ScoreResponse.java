package com.example.ecomanager.responses;

import com.example.ecomanager.models.Score;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class ScoreResponse {

    private Long id;

    private Long employeeId;

    private Long meetingId;

    private String employeeName;

    private String meetingName;

    private LocalDate meetingDate;

    private int score;

    private String comment;

    public static ScoreResponse fromScore(Score score) {
        return ScoreResponse.builder()
                .id(score.getId())
                .employeeId(score.getEmployee().getId())
                .meetingId(score.getMeeting().getId())
                .employeeName(score.getEmployee().getFullName())
                .meetingName(score.getMeeting().getTitle())
                .meetingDate(score.getMeeting().getMeetingDate())
                .score(score.getScore())
                .comment(score.getComment())
                .build();
    }

}
