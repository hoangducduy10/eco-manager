package com.example.ecomanager.repositories;

import com.example.ecomanager.models.Meeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Optional<Meeting> findByTitle(String title);

    @Query("""
        SELECT m FROM Meeting m
        WHERE (:title IS NULL OR :title = '' OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
        AND (:meetingDate IS NULL OR m.meetingDate = :meetingDate)
        """)
    Page<Meeting> findByTitleAndMeetingDate(@Param("title") String title,
                                            @Param("meetingDate") LocalDate meetingDate,
                                            Pageable pageable);

}
