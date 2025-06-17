package com.example.ecomanager.repositories;

import com.example.ecomanager.models.FileMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {

    Optional<FileMetadata> findByFileName(String fileName);

    Optional<FileMetadata> findTopByFileNameAndStatusOrderByCreatedAtDesc(String fileName, String status);

    @Query("SELECT f FROM FileMetadata f WHERE f.fileName = :fileName ORDER BY CAST(SUBSTRING(f.version, 2) AS int) DESC")
    List<FileMetadata> findAllByFileNameOrderByVersionDesc(String fileName);

    @Query("""
        SELECT f FROM FileMetadata f
        WHERE (:fileName IS NULL OR :fileName = '' OR LOWER(f.fileName) LIKE LOWER(CONCAT('%', :fileName, '%')))
    """)
    Page<FileMetadata> getAllByFileName(String fileName, Pageable pageable);

}
