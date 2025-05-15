package com.example.ecomanager.responses;

import com.example.ecomanager.models.Meeting;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class MeetingResponse {

    private Long id;

    private String title;

    @JsonProperty("meeting_date")
    private LocalDate meetingDate;

    private String description;

    public static MeetingResponse fromMeeting(Meeting meeting) {
        return MeetingResponse.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .meetingDate(meeting.getMeetingDate())
                .description(meeting.getDescription())
                .build();
    }

}
