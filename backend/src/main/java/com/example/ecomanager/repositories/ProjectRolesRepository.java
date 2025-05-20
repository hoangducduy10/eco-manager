package com.example.ecomanager.repositories;

import com.example.ecomanager.enums.EmployeeRole;
import com.example.ecomanager.models.ProjectRoles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRolesRepository extends JpaRepository<ProjectRoles, Long> {

    Optional<ProjectRoles> findByName(EmployeeRole name);

}
