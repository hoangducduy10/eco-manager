package com.example.ecomanager.responses;

import com.example.ecomanager.models.Role;
import com.example.ecomanager.models.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserResponse {

    private Long id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("password")
    private String password;

    @JsonProperty("is_active")
    private boolean active;

    @JsonProperty("role_id")
    private Role role;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .password(user.getPassword())
                .active(user.isActive())
                .role(user.getRole())
                .build();
    }

}
