package com.rms.repository;

import com.rms.model.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    @Query("SELECT i FROM Ingredient i WHERE i.status != 'DELETED' AND " +
            "(:keyword = '' OR LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(i.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:categoryId = -1L OR i.category.id = :categoryId) AND " +
            "(:supplierId = -1L OR i.supplier.id = :supplierId) AND " +
            "(:status = '' OR i.status = :status)")
    Page<Ingredient> searchAndFilter(@Param("keyword") String keyword,
                                     @Param("categoryId") Long categoryId,
                                     @Param("supplierId") Long supplierId,
                                     @Param("status") String status,
                                     Pageable pageable);
}