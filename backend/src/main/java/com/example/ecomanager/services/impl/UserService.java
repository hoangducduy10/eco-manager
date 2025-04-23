package com.example.ecomanager.services.impl;

import com.example.ecomanager.components.JwtUtil;
import com.example.ecomanager.dtos.UserDTO;
import com.example.ecomanager.enums.RoleName;
import com.example.ecomanager.exceptions.DataNotFoundException;
import com.example.ecomanager.exceptions.PermissionDenyException;
import com.example.ecomanager.models.Role;
import com.example.ecomanager.models.User;
import com.example.ecomanager.repositories.RoleRepository;
import com.example.ecomanager.repositories.UserRepository;
import com.example.ecomanager.services.IUserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;


    @Override
    @Transactional
    public User register(UserDTO userDTO) throws Exception {
        String phoneNumber = userDTO.getPhoneNumber();
        if(userRepository.existsByPhoneNumber(phoneNumber)){
            throw new DataIntegrityViolationException("Phone number already exists!");
        }

        Role role = roleRepository.findById(userDTO.getRoleId())
                .orElseThrow(() -> new DataNotFoundException("Role not found!"));
        if (role.getName() == RoleName.ADMIN) {
            throw new PermissionDenyException("Cannot register an admin user!");
        }

        User user = modelMapper.map(userDTO, User.class);
        user.setId(null);
        user.setRole(role);
        user.setActive(true);

        String password = userDTO.getPassword();
        String encodedPassword = passwordEncoder.encode(password);
        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    private User validateUserCredentials(String phoneNumber, String password) throws Exception {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new DataNotFoundException("Invalid phone number or password!"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Phone number or password is incorrect!");
        }

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(phoneNumber, password, user.getAuthorities());
        authenticationManager.authenticate(authenticationToken);

        return user;
    }

    @Override
    public String login(String phoneNumber, String password) throws Exception {
        User user = validateUserCredentials(phoneNumber, password);

        RoleName roleName = user.getRole().getName();
        if (roleName != RoleName.ADMIN && roleName != RoleName.STAFF) {
            throw new PermissionDenyException("You do not have permission to access this resource!");
        }

        return jwtUtil.generateToken(user);
    }

}
