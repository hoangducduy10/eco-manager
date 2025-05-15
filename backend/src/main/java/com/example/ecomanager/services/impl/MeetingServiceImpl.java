package com.example.ecomanager.services.impl;

import com.example.ecomanager.dtos.MeetingDTO;
import com.example.ecomanager.exceptions.DataNotFoundException;
import com.example.ecomanager.models.Meeting;
import com.example.ecomanager.repositories.MeetingRepository;
import com.example.ecomanager.responses.MeetingResponse;
import com.example.ecomanager.services.IMeetingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class MeetingServiceImpl implements IMeetingService {

    private final MeetingRepository meetingRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<MeetingResponse> getMeetings(String title, LocalDate meetingDate, Pageable pageable) {
        Page<Meeting> meetingPage = meetingRepository.findByTitleAndMeetingDate(title, meetingDate, pageable);
        return meetingPage.map(MeetingResponse::fromMeeting);
    }

    @Override
    public MeetingResponse getMeetingById(Long id) throws Exception {
       Meeting meeting = meetingRepository.findById(id)
               .orElseThrow(() -> new DataNotFoundException("Meeting not found with id: " + id)
       );
       return MeetingResponse.fromMeeting(meeting);
    }

    @Override
    @Transactional
    public MeetingResponse createMeeting(MeetingDTO meetingDTO) throws Exception {
        if(meetingRepository.findByTitle(meetingDTO.getTitle()).isPresent()) {;
            throw new RuntimeException("Meeting with title " + meetingDTO.getTitle() + " already exists!");
        }

        Meeting meeting = modelMapper.map(meetingDTO, Meeting.class);
        meeting.setId(null);

        return MeetingResponse.fromMeeting(meetingRepository.save(meeting));
    }

    @Override
    @Transactional
    public MeetingResponse updateMeeting(Long id, MeetingDTO meetingDTO) throws Exception {
        Meeting existingMeeting = meetingRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Meeting not found with id: " + id));

        modelMapper.map(meetingDTO, existingMeeting);
        return MeetingResponse.fromMeeting(meetingRepository.save(existingMeeting));
    }

    @Override
    @Transactional
    public void deleteMeeting(Long id) throws Exception {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Meeting not found with id: " + id));

        meetingRepository.delete(meeting);
    }
}
