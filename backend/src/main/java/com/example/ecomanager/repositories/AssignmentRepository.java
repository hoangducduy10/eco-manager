package com.example.ecomanager.repositories;

import com.example.ecomanager.models.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("""
        SELECT a FROM Assignment a
        JOIN a.productId p
        JOIN a.employeeId e
        WHERE (:productName IS NULL OR :productName = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :productName, '%') ) )
        AND (:employeeName IS NULL OR :employeeName = '' OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%') ) )
        AND (:assignedDate IS NULL OR a.assignedDate = :assignedDate)
    """)
    Page<Assignment> findByProductNameAndEmployeeNameAndAssignDate(
            @Param("productName") String productName,
            @Param("employeeName") String employeeName,
            @Param("assignedDate") LocalDate assignedDate,
            Pageable pageable
    );

}
