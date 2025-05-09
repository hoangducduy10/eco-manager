package com.example.ecomanager.repositories;

import com.example.ecomanager.enums.ProductStatus;
import com.example.ecomanager.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
            SELECT p FROM Product p
            WHERE (:name IS NULL OR :name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
            AND (:status IS NULL OR p.status = :status)
            """)
    Page<Product> findByNameAndStatus(@Param("name") String name,
                                         @Param("status") ProductStatus status,
                                         Pageable pageable);

}
