package com.example.ecomanager.services.impl;

import com.example.ecomanager.dtos.AssignmentDTO;
import com.example.ecomanager.enums.AssignmentStatus;
import com.example.ecomanager.enums.EmployeeRole;
import com.example.ecomanager.exceptions.DataNotFoundException;
import com.example.ecomanager.models.Assignment;
import com.example.ecomanager.models.Employee;
import com.example.ecomanager.models.Product;
import com.example.ecomanager.models.ProjectRoles;
import com.example.ecomanager.repositories.AssignmentRepository;
import com.example.ecomanager.repositories.EmployeeRepository;
import com.example.ecomanager.repositories.ProductRepository;
import com.example.ecomanager.repositories.ProjectRolesRepository;
import com.example.ecomanager.responses.AssignmentResponse;
import com.example.ecomanager.services.IAssignmentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements IAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final ProductRepository productRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRolesRepository projectRolesRepository;

    @Override
    public Page<AssignmentResponse> getAssignments(String productName, String employeeName, LocalDate assignedDate, Pageable pageable) {
        Page<Assignment> assignmentPage = assignmentRepository.findByProductNameAndEmployeeNameAndAssignDate(productName, employeeName, assignedDate, pageable);
        return assignmentPage.map(AssignmentResponse::fromAssignment);
    }

    @Override
    public AssignmentResponse getAssignmentById(Long id) throws Exception {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Assignment not found with id: " +id));

        return AssignmentResponse.fromAssignment(assignment);
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(AssignmentDTO assignmentDTO) throws Exception {
        Product product = productRepository.findById(assignmentDTO.getProductId())
                .orElseThrow(() -> new DataNotFoundException("Product not found with id: " +assignmentDTO.getProductId()));

        Employee employee = employeeRepository.findById(assignmentDTO.getEmployeeId())
                .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " +assignmentDTO.getEmployeeId()));

        Assignment assignment = new Assignment();
        assignment.setId(null);
        assignment.setProductId(product);
        assignment.setEmployeeId(employee);
        assignment.setProjectRoles(getProjectRoleFromDto(assignmentDTO.getEmployeeRole()));
        assignment.setAssignedDate(LocalDate.now());
        assignment.setEndDate(assignmentDTO.getEndDate());

        if(assignmentDTO.getStatus() != null && !assignmentDTO.getStatus().isEmpty()) {
            try {
                AssignmentStatus status = AssignmentStatus.fromString(assignmentDTO.getStatus());
                assignment.setStatus(status);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status value: " + assignmentDTO.getStatus());
            }
        } else {
            assignment.setStatus(AssignmentStatus.ACTIVE);
        }

        return AssignmentResponse.fromAssignment(assignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public AssignmentResponse updateAssignment(Long id, AssignmentDTO assignmentDTO) throws Exception {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Assignment not found with id: " + id));

        Product product = productRepository.findById(assignmentDTO.getProductId())
                .orElseThrow(() -> new DataNotFoundException("Product not found with id: " + assignmentDTO.getProductId()));
        Employee employee = employeeRepository.findById(assignmentDTO.getEmployeeId())
                .orElseThrow(() -> new DataNotFoundException("Employee not found with id: " + assignmentDTO.getEmployeeId()));

        assignment.setProductId(product);
        assignment.setEmployeeId(employee);
        assignment.setProjectRoles(getProjectRoleFromDto(assignmentDTO.getEmployeeRole()));
        assignment.setAssignedDate(assignmentDTO.getAssignedDate() != null ? assignmentDTO.getAssignedDate() : assignment.getAssignedDate());
        assignment.setEndDate(assignmentDTO.getEndDate());

        if (assignmentDTO.getStatus() != null && !assignmentDTO.getStatus().isEmpty()) {
            try {
                AssignmentStatus status = AssignmentStatus.fromString(assignmentDTO.getStatus());
                assignment.setStatus(status);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status value: " + assignmentDTO.getStatus());
            }
        } else {
            assignment.setStatus(AssignmentStatus.ACTIVE);
        }

        LocalDate assignedDate = assignment.getAssignedDate();
        LocalDate endDate = assignment.getEndDate();
        if (endDate != null && endDate.isBefore(assignedDate)) {
            throw new IllegalArgumentException("End date cannot be before assigned date!");
        }

        return AssignmentResponse.fromAssignment(assignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void deleteAssignment(Long id) throws Exception {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Assignment not found with id: " + id));

        assignmentRepository.delete(assignment);
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
