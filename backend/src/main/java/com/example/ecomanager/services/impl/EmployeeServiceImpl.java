package com.example.ecomanager.services.impl;

import com.example.ecomanager.dtos.EmployeeDTO;
import com.example.ecomanager.enums.EmployeeRole;
import com.example.ecomanager.exceptions.DataNotFoundException;
import com.example.ecomanager.models.Employee;
import com.example.ecomanager.models.ProjectRoles;
import com.example.ecomanager.repositories.EmployeeRepository;
import com.example.ecomanager.repositories.ProjectRolesRepository;
import com.example.ecomanager.responses.EmployeeResponse;
import com.example.ecomanager.services.IEmployeeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements IEmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRolesRepository projectRolesRepository;
    private final ModelMapper modelMapper;


    @Override
    public Page<EmployeeResponse> getEmployees(String fullName, EmployeeRole role, Boolean active, Pageable pageable) {
        Page<Employee> employees = employeeRepository.findByFullNameAndRoleAndActive(fullName, role, active, pageable);
        return employees.map(EmployeeResponse::fromEmployee);
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) throws Exception {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " +id));

        return EmployeeResponse.fromEmployee(employee);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeDTO employeeDTO) throws Exception {
        if(employeeRepository.findByEmail(employeeDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Employee with email " + employeeDTO.getEmail() + " already exists!");
        }

        Employee employee = modelMapper.map(employeeDTO, Employee.class);
        employee.setId(null);
        employee.setActive("Active".equalsIgnoreCase(employeeDTO.getStatus()));
        employee.setProjectRole(getProjectRoleFromDto(employeeDTO.getRole()));

        return EmployeeResponse.fromEmployee(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeDTO employeeDTO) throws Exception {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " +id));

        Optional<Employee> existingByEmail = employeeRepository.findByEmail(employeeDTO.getEmail());
        if (existingByEmail.isPresent() && !existingByEmail.get().getId().equals(id)) {
            throw new RuntimeException("Employee with email " + employeeDTO.getEmail() + " already exists!");
        }

        modelMapper.map(employeeDTO, existingEmployee);
        existingEmployee.setProjectRole(getProjectRoleFromDto(employeeDTO.getRole()));

        if (employeeDTO.getStatus() != null) {
            existingEmployee.setActive("Active".equalsIgnoreCase(employeeDTO.getStatus()));
        }

        return EmployeeResponse.fromEmployee(employeeRepository.save(existingEmployee));
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) throws Exception {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " +id));

        employeeRepository.delete(employee);
    }

    private ProjectRoles getProjectRoleFromDto(String roleStr) throws Exception {
        if (roleStr == null || roleStr.isEmpty()) {
            throw new IllegalArgumentException("Role must not be null or empty!");
        }

        try {
            EmployeeRole employeeRole = EmployeeRole.fromString(roleStr);
            return projectRolesRepository.findByName(employeeRole)
                    .orElseThrow(() -> new DataNotFoundException("Project role not found with name: " + roleStr));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role value: " + roleStr);
        }
    }


}
