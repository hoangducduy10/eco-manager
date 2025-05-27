package com.example.ecomanager.responses;

import com.example.ecomanager.models.Assignment;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class AssignmentResponse {

    private Long id;

    private Long productId;

    private Long employeeId;

    private String productName;

    private String employeeName;

    private String role;

    @JsonProperty("assigned_date")
    private LocalDate assignedDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    private String status;

    public static AssignmentResponse fromAssignment(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .productId(assignment.getProductId().getId())
                .employeeId(assignment.getEmployeeId().getId())
                .productName(assignment.getProductId().getName())
                .employeeName(assignment.getEmployeeId().getFullName())
                .role(assignment.getProjectRoles().getName().name())
                .assignedDate(assignment.getAssignedDate())
                .endDate(assignment.getEndDate())
                .status(assignment.getStatus().name())
                .build();
    }

}
