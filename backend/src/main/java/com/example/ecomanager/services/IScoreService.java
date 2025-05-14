package com.example.ecomanager.services;

import com.example.ecomanager.dtos.ScoreDTO;
import com.example.ecomanager.responses.ScoreResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface IScoreService {

    Page<ScoreResponse> getAllScores(String employeeName, String meetingName, LocalDate meetingDate, Pageable pageable);

    ScoreResponse createScore(ScoreDTO scoreDTO) throws Exception;

    ScoreResponse getScoreById(Long id) throws Exception;

    ScoreResponse updateScore(Long id, ScoreDTO scoreDTO) throws Exception;

    void deleteScore(Long id) throws Exception;

}
