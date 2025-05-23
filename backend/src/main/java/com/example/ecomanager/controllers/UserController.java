package com.example.ecomanager.controllers;

import com.example.ecomanager.dtos.UserDTO;
import com.example.ecomanager.dtos.UserLoginDTO;
import com.example.ecomanager.models.User;
import com.example.ecomanager.responses.LoginResponse;
import com.example.ecomanager.responses.RegisterResponse;
import com.example.ecomanager.responses.UserResponse;
import com.example.ecomanager.services.impl.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserServiceImpl userServiceImpl;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> registerStaff(
            @Valid @RequestBody UserDTO userDTO,
            BindingResult bindingResult
    ){
        try {
            if(bindingResult.hasErrors()){
                List<String> errors = bindingResult.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(RegisterResponse.builder()
                        .message("Register failed!")
                        .build());
            }

            if(!userDTO.getPassword().equals(userDTO.getRetypePassword())){
                return ResponseEntity.badRequest().body(RegisterResponse.builder()
                        .message("Password do not match!")
                        .build());
            }

            User user = userServiceImpl.register(userDTO);
            return ResponseEntity.ok(RegisterResponse.builder()
                    .message("Register successful!")
                    .build());
        }catch (Exception e){
            return ResponseEntity.badRequest().body(RegisterResponse.builder()
                    .message("Register failed!")
                    .build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody UserLoginDTO userLoginDTO) {
        try {
            String token = userServiceImpl.login(
                    userLoginDTO.getPhoneNumber(),
                    userLoginDTO.getPassword()
            );
            return ResponseEntity.ok(LoginResponse.builder()
                    .message("Login successful!")
                    .token(token)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(LoginResponse.builder()
                    .message("Login failed!")
                    .build());
        }
    }

    @PostMapping("/users/details")
    public ResponseEntity<UserResponse> getUserDetails(@RequestHeader("Authorization") String authorizationHeader){
        try {
            String extractedToken = authorizationHeader.substring(7);
            User user = userServiceImpl.getUserDetailsFromToken(extractedToken);
            return ResponseEntity.ok(UserResponse.fromUser(user));
        }catch (Exception e){
            return ResponseEntity.badRequest().build();
        }
    }

}

