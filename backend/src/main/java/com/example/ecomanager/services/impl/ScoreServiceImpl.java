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
        Employee employee = employeeRepository.findById(scoreDTO.getEmployee())
                .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " + scoreDTO.getEmployee()));

        Meeting meeting = meetingRepository.findById(scoreDTO.getMeeting())
                .orElseThrow(() -> new DataNotFoundException("Meeting not found with id: " + scoreDTO.getMeeting()));

        Score score = modelMapper.map(scoreDTO, Score.class);
        score.setId(null);
        score.setEmployee(employee);
        score.setMeeting(meeting);

        return ScoreResponse.fromScore(scoreRepository.save(score));
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
        Score score = scoreRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Score not found with id: " + id));

        if(!score.getEmployee().getId().equals(scoreDTO.getEmployee())){
            Employee employee = employeeRepository.findById(scoreDTO.getEmployee())
                    .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " + scoreDTO.getEmployee()));
            score.setEmployee(employee);
        }

        if (!score.getMeeting().getId().equals(scoreDTO.getMeeting())) {
            Meeting meeting = meetingRepository.findById(scoreDTO.getMeeting())
                    .orElseThrow(() -> new DataNotFoundException("Meeting not found with id: " + scoreDTO.getMeeting()));
            score.setMeeting(meeting);
        }

        score.setScore(scoreDTO.getScore());
        score.setComment(scoreDTO.getComment());

        return ScoreResponse.fromScore(scoreRepository.save(score));
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
