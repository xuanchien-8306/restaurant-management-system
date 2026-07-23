package com.rms.repository;

import com.rms.model.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByStatus(String status);

    @Query("SELECT m FROM MenuItem m WHERE m.status = 'AVAILABLE' " +
            "AND (:keyword IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:categoryId IS NULL OR m.category.id = :categoryId) " +
            "AND (:minPrice IS NULL OR m.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR m.price <= :maxPrice)")
    Page<MenuItem> filterMenu(@Param("keyword") String keyword,
                              @Param("categoryId") Long categoryId,
                              @Param("minPrice") BigDecimal minPrice,
                              @Param("maxPrice") BigDecimal maxPrice,
                              Pageable pageable);

    @Query("SELECT m FROM MenuItem m WHERE m.status != 'DELETED' AND " +
            "(:keyword IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
            "(:status IS NULL OR m.status = :status)")
    Page<MenuItem> filterMenuAdmin(@Param("keyword") String keyword,
                                   @Param("categoryId") Long categoryId,
                                   @Param("status") String status,
                                   Pageable pageable);
}