package com.example.ecomanager.responses;

import com.example.ecomanager.models.Employee;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class EmployeeResponse {

    private Long id;

    @JsonProperty("full_name")
    private String fullName;

    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;

    private String role;

    private String status;

    public static EmployeeResponse fromEmployee(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phoneNumber(employee.getPhoneNumber())
                .role(employee.getProjectRole().getName().name())
                .status(employee.isActive() ? "Active": "Inactive")
                .build();
    }

}
