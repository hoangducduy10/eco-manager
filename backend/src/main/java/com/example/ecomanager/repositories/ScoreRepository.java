package com.example.ecomanager.repositories;

import com.example.ecomanager.models.Score;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    @Query("""
        SELECT s FROM Score s
        JOIN s.employee e
        JOIN s.meeting m
        WHERE (:employeeName IS NULL OR :employeeName = '' OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%')))
        AND (:meetingName IS NULL OR :meetingName = '' OR LOWER(m.title) LIKE LOWER(CONCAT('%', :meetingName, '%')))
        AND (:meetingDate IS NULL OR m.meetingDate = :meetingDate)
    """)
    Page<Score> findByEmployeeNameAndMeetingNameAndMeetingDate(
            @Param("employeeName") String employeeName,
            @Param("meetingName") String meetingName,
            @Param("meetingDate") LocalDate meetingDate,
            Pageable pageable
    );
}
