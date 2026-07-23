package com.rms.repository;

import com.rms.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByStatusNot(String status);

    List<Category> findByStatus(String status);

    @Query("SELECT c FROM Category c WHERE c.status != 'DELETED' AND " +
            "(:keyword = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:status = '' OR c.status = :status)")
    Page<Category> searchAndFilterCategory(@Param("keyword") String keyword,
                                           @Param("status") String status,
                                           Pageable pageable);

    Optional<Category> findByName(String name);
}