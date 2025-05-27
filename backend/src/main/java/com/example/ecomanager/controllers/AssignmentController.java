package com.example.ecomanager.controllers;

import com.example.ecomanager.dtos.AssignmentDTO;
import com.example.ecomanager.responses.AssignmentResponse;
import com.example.ecomanager.responses.BaseListResponse;
import com.example.ecomanager.services.IAssignmentService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final IAssignmentService assignmentServiceImpl;

    @GetMapping
    public ResponseEntity<BaseListResponse<AssignmentResponse>> getAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate assignedDate
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<AssignmentResponse> assignmentPage = assignmentServiceImpl.getAssignments(productName, employeeName, assignedDate, pageRequest);
        List<AssignmentResponse> assignmentList = assignmentPage.getContent();

        return ResponseEntity.ok(BaseListResponse.<AssignmentResponse>builder()
                .items(assignmentList)
                .totalPages(assignmentPage.getTotalPages())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) throws Exception {
        AssignmentResponse assignmentResponse = assignmentServiceImpl.getAssignmentById(id);
        return ResponseEntity.ok(assignmentResponse);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAssignment(
            @Valid @RequestBody AssignmentDTO assignmentDTO,
            BindingResult bindingResult
            )  throws Exception {
        if(bindingResult.hasErrors()){
            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errors);
        }

        AssignmentResponse assignmentResponse = assignmentServiceImpl.createAssignment(assignmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentResponse);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentDTO assignmentDTO,
            BindingResult bindingResult
            ) throws Exception {
        if(bindingResult.hasErrors()){
            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errors);
        }

        AssignmentResponse assignmentResponse = assignmentServiceImpl.updateAssignment(id, assignmentDTO);
        return ResponseEntity.ok(assignmentResponse);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) throws Exception {
        assignmentServiceImpl.deleteAssignment(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Assignment deleted successfully!");

        return ResponseEntity.ok(response);
    }

}
