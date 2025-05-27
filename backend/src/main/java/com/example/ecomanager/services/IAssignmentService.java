package com.example.ecomanager.services;

import com.example.ecomanager.dtos.AssignmentDTO;
import com.example.ecomanager.enums.AssignmentStatus;
import com.example.ecomanager.responses.AssignmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface IAssignmentService {

    Page<AssignmentResponse> getAssignments(String productName, String employeeName, LocalDate assignedDate, Pageable pageable);

    AssignmentResponse getAssignmentById(Long id) throws Exception;

    AssignmentResponse createAssignment(AssignmentDTO assignmentDTO) throws Exception;

    AssignmentResponse updateAssignment(Long id, AssignmentDTO assignmentDTO) throws Exception;

    void deleteAssignment(Long id) throws Exception;

}
