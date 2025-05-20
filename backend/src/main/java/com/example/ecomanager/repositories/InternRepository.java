package com.example.ecomanager.repositories;

import com.example.ecomanager.models.Intern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InternRepository extends JpaRepository<Intern, Long> {

    Optional<Intern> findByEmail(String email);

    @Query("""
        SELECT i FROM Intern i
        WHERE (:fullName IS NULL OR :fullName = '' OR LOWER(i.fullName) LIKE LOWER(CONCAT('%', :fullName, '%')))
        AND (:active IS NULL OR i.active = :active)
    """)
    Page<Intern> findByFullNameAndActive(@Param("fullName") String fullName,
                                         @Param("active") Boolean active,
                                         Pageable pageable);

}
