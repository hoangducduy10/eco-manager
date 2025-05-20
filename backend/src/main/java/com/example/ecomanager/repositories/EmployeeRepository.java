package com.example.ecomanager.repositories;

import com.example.ecomanager.enums.EmployeeRole;
import com.example.ecomanager.models.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    @Query("""
        SELECT e FROM Employee e
        WHERE (:fullName IS NULL OR :fullName = '' OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :fullName, '%')))
        AND (:role IS NULL OR e.projectRole.name = :role)
        AND (:active IS NULL OR e.active = :active)
    """)
    Page<Employee> findByFullNameAndRoleAndActive(@Param("fullName") String fullName,
                                         @Param("role") EmployeeRole role,
                                         @Param("active") Boolean active,
                                         Pageable pageable);

}
