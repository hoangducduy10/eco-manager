package com.example.ecomanager.responses;

import com.example.ecomanager.models.Intern;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
@Builder
public class InternResponse {

    private Long id;

    @JsonProperty("full_name")
    private String fullName;

    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("start_date")
    private String startDate;

    @JsonProperty("status")
    private String status;

    public static InternResponse fromIntern(Intern intern) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return InternResponse.builder()
                .id(intern.getId())
                .fullName(intern.getFullName())
                .email(intern.getEmail())
                .phoneNumber(intern.getPhoneNumber())
                .startDate(intern.getStartDate() != null
                        ? intern.getStartDate().format(fmt)
                        : null)
                .status(intern.getActive() ? "Active" : "Inactive")
                .build();
    }

}
