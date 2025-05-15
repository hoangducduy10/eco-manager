package com.example.ecomanager.services;

import com.example.ecomanager.dtos.MeetingDTO;
import com.example.ecomanager.responses.MeetingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface IMeetingService {

    Page<MeetingResponse> getMeetings(String title, LocalDate meetingDate, Pageable pageable);

    MeetingResponse getMeetingById(Long id) throws Exception;

    MeetingResponse createMeeting(MeetingDTO meetingDTO) throws Exception;

    MeetingResponse updateMeeting(Long id, MeetingDTO meetingDTO) throws Exception;

    void deleteMeeting(Long id) throws Exception;

}
