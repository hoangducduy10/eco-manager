package com.example.ecomanager.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class InternDTO {

    @NotBlank(message = "Full name is required!")
    @JsonProperty("full_name")
    private String fullName;

    @NotBlank(message = "Email is required!")
    @Email(message = "Email should be valid!")
    private String email;

    @NotBlank(message = "Phone number is required!")
    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("start_date")
    private String startDate;

    @JsonProperty("status")
    private String status;

}
