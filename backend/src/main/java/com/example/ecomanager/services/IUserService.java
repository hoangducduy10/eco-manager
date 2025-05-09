package com.example.ecomanager.services;

import com.example.ecomanager.dtos.UserDTO;
import com.example.ecomanager.models.User;

public interface IUserService {

    User register(UserDTO userDTO) throws Exception;

    String login(String phoneNumber, String password) throws Exception;

    User getUserDetailsFromToken(String token) throws Exception;

}
