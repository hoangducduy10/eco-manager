package com.example.ecomanager.responses;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class ScoreListResponse {

    private List<ScoreResponse> scores;

    private int totalPages;

}