package com.rms.repository;

import com.rms.model.IngredientCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IngredientCategoryRepository extends JpaRepository<IngredientCategory, Long> {
    List<IngredientCategory> findByStatusNot(String status);
}