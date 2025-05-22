package com.example.ecomanager.services.impl;

import com.example.ecomanager.dtos.ScoreDTO;
import com.example.ecomanager.exceptions.DataNotFoundException;
import com.example.ecomanager.models.Employee;
import com.example.ecomanager.models.Meeting;
import com.example.ecomanager.models.Score;
import com.example.ecomanager.repositories.EmployeeRepository;
import com.example.ecomanager.repositories.MeetingRepository;
import com.example.ecomanager.repositories.ScoreRepository;
import com.example.ecomanager.responses.ScoreResponse;
import com.example.ecomanager.services.IScoreService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ScoreServiceImpl implements IScoreService {

    private final ScoreRepository scoreRepository;
    private final EmployeeRepository employeeRepository;
    private final MeetingRepository meetingRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<ScoreResponse> getAllScores(String employeeName, String meetingName, LocalDate meetingDate, Pageable pageable) {
        Page<Score> scorePage = scoreRepository.findByEmployeeNameAndMeetingNameAndMeetingDate(employeeName, meetingName, meetingDate, pageable);
        return scorePage.map(ScoreResponse::fromScore);
    }

    @Override
    @Transactional
    public ScoreResponse createScore(ScoreDTO scoreDTO) throws Exception {
        Employee employee = employeeRepository.findById(scoreDTO.getEmployeeId())
                .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " + scoreDTO.getEmployeeId()));

        Meeting meeting = meetingRepository.findById(scoreDTO.getMeetingId())
                .orElseThrow(() -> new DataNotFoundException("Meeting not found with id: " + scoreDTO.getMeetingId()));

        Score score = new Score();
        score.setId(null);
        score.setEmployee(employee);
        score.setMeeting(meeting);
        score.setScore(scoreDTO.getScore());
        score.setComment(scoreDTO.getComment());

        Score savedScore = scoreRepository.save(score);

        return ScoreResponse.fromScore(savedScore);
    }

    @Override
    public ScoreResponse getScoreById(Long id) throws Exception {
        Score score = scoreRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Score not found with id: " + id));

        return ScoreResponse.fromScore(score);
    }

    @Override
    @Transactional
    public ScoreResponse updateScore(Long id, ScoreDTO scoreDTO) throws Exception {
        if (scoreDTO.getEmployeeId() == null) {
            throw new IllegalArgumentException("EmployeeId must not be null!");
        }

        Score score = scoreRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Score not found with id: " + id));

        if (!score.getEmployee().getId().equals(scoreDTO.getEmployeeId())) {
            Employee employee = employeeRepository.findById(scoreDTO.getEmployeeId())
                    .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " + scoreDTO.getEmployeeId()));
            score.setEmployee(employee);
        }

        if (!score.getMeeting().getId().equals(scoreDTO.getMeetingId())) {
            Meeting meeting = meetingRepository.findById(scoreDTO.getMeetingId())
                    .orElseThrow(() -> new DataNotFoundException("Meeting not found with id: " + scoreDTO.getMeetingId()));
            score.setMeeting(meeting);
        }

        score.setScore(scoreDTO.getScore());
        score.setComment(scoreDTO.getComment());

        Score savedScore = scoreRepository.save(score);

        return ScoreResponse.fromScore(savedScore);
    }


    @Override
    @Transactional
    public void deleteScore(Long id) throws Exception {
        if(!scoreRepository.existsById(id)) {
            throw new DataNotFoundException("Score not found with id: " + id);
        }

        scoreRepository.deleteById(id);
    }
}
