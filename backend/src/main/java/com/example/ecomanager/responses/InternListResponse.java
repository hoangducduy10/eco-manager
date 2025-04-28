package com.example.ecomanager.responses;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class InternListResponse {

    private List<InternResponse> interns;

    private int totalPages;

}
