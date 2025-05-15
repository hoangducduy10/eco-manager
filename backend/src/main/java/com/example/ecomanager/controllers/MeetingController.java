package com.example.ecomanager.controllers;

import com.example.ecomanager.dtos.MeetingDTO;
import com.example.ecomanager.responses.MeetingListResponse;
import com.example.ecomanager.responses.MeetingResponse;
import com.example.ecomanager.services.IMeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/meetings")
public class MeetingController {

    private final IMeetingService meetingService;

    @GetMapping
    public ResponseEntity<MeetingListResponse> getMeetings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate meetingDate
            ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<MeetingResponse> meetingPage = meetingService.getMeetings(title, meetingDate, pageRequest);
        List<MeetingResponse> meetingList = meetingPage.getContent();

        return ResponseEntity.ok(MeetingListResponse.builder()
                .meetings(meetingList)
                .totalPages(meetingPage.getTotalPages())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getMeetingById(@PathVariable Long id) throws Exception {
        MeetingResponse meetingResponse = meetingService.getMeetingById(id);
        return ResponseEntity.ok(meetingResponse);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createMeeting(
            @Valid @RequestBody MeetingDTO meetingDTO,
            BindingResult bindingResult
            ) throws Exception {
        if(bindingResult.hasErrors()){
            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errors);
        }

        MeetingResponse meetingResponse = meetingService.createMeeting(meetingDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(meetingResponse);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMeeting(
            @PathVariable Long id,
            @Valid @RequestBody MeetingDTO meetingDTO,
            BindingResult bindingResult
            ) throws Exception {
        if(bindingResult.hasErrors()){
            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errors);
        }

        MeetingResponse meetingResponse = meetingService.updateMeeting(id, meetingDTO);
        return ResponseEntity.ok(meetingResponse);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMeeting(@PathVariable Long id) throws Exception {
        meetingService.deleteMeeting(id);
        return ResponseEntity.ok("Meeting deleted successfully");
    }

}
