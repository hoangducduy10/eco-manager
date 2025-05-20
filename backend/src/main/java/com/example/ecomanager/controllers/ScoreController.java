package com.example.ecomanager.controllers;

import com.example.ecomanager.dtos.ScoreDTO;
import com.example.ecomanager.responses.BaseListResponse;
import com.example.ecomanager.responses.ScoreResponse;
import com.example.ecomanager.services.IScoreService;
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
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final IScoreService scoreService;

    @GetMapping
    public ResponseEntity<BaseListResponse<ScoreResponse>> getAllScores(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) String meetingName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate meetingDate
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<ScoreResponse> scorePage = scoreService.getAllScores(employeeName, meetingName, meetingDate, pageRequest);
        List<ScoreResponse> scoreList = scorePage.getContent();

        return ResponseEntity.ok(BaseListResponse.<ScoreResponse>builder()
                .items(scoreList)
                .totalPages(scorePage.getTotalPages())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScoreResponse> getScoreById(@PathVariable Long id) throws Exception {
        ScoreResponse scoreResponse = scoreService.getScoreById(id);
        return ResponseEntity.ok(scoreResponse);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createScore(
            @Valid @RequestBody ScoreDTO scoreDTO,
            BindingResult bindingResult
    ) throws Exception {
        if(bindingResult.hasErrors()){
            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errors);
        }

        ScoreResponse scoreResponse = scoreService.createScore(scoreDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(scoreResponse);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateScore(
            @PathVariable Long id,
            @Valid @RequestBody ScoreDTO scoreDTO,
            BindingResult bindingResult
    ) throws Exception {
        if(bindingResult.hasErrors()){
            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errors);
        }

        ScoreResponse scoreResponse = scoreService.updateScore(id, scoreDTO);
        return ResponseEntity.ok(scoreResponse);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteScore(@PathVariable Long id) throws Exception {
        scoreService.deleteScore(id);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Score deleted successfully!");
        return ResponseEntity.ok(response);
    }
}