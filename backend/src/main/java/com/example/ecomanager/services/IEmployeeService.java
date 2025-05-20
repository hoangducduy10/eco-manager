package com.example.ecomanager.services;

import com.example.ecomanager.dtos.EmployeeDTO;
import com.example.ecomanager.dtos.InternDTO;
import com.example.ecomanager.enums.EmployeeRole;
import com.example.ecomanager.responses.EmployeeResponse;
import com.example.ecomanager.responses.InternResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IEmployeeService {

    Page<EmployeeResponse> getEmployees(String fullName, EmployeeRole role, Boolean active, Pageable pageable);

    EmployeeResponse getEmployeeById(Long id) throws Exception;

    EmployeeResponse createEmployee(EmployeeDTO employeeDTO) throws Exception;

    EmployeeResponse updateEmployee(Long id, EmployeeDTO employeeDTO) throws Exception;

    void deleteEmployee(Long id) throws Exception;

}
