package com.example.ecomanager.responses;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class MeetingListResponse {

    private List<MeetingResponse> meetings;

    private int totalPages;

}
