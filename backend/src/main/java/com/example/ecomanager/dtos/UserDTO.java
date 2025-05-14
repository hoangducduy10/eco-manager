package com.example.ecomanager.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class UserDTO {

    @JsonProperty("name")
    private String name;

    @NotBlank(message = "Phone number is required!")
    @JsonProperty("phone_number")
    private String phoneNumber;

    @NotBlank(message = "Password cannot be empty!")
    private String password;

    @JsonProperty("retype_password")
    private String retypePassword;

    @NotNull(message = "Role ID is required!")
    @JsonProperty("role_id")
    private Long roleId;

}