package com.example.ecomanager.repositories;

import com.example.ecomanager.models.ProjectRoles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRolesRepository extends JpaRepository<ProjectRoles, Long> {
}
