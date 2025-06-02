package com.example.ecomanager.dtos;

import com.example.ecomanager.models.Employee;
import com.example.ecomanager.models.Product;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AssignmentDTO {

    private Long productId;

    private Long employeeId;

    private String employeeRole;

    @JsonProperty("assigned_date")
    private LocalDate assignedDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    @JsonProperty("status")
    private String status;

}
