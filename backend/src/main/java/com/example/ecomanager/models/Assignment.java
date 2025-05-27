package com.example.ecomanager.models;

import com.example.ecomanager.enums.AssignmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "assignments")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private AssignmentStatus status;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employeeId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product productId;

    @ManyToOne
    @JoinColumn(name = "project_role_id", nullable = false)
    private ProjectRoles projectRoles;

}
