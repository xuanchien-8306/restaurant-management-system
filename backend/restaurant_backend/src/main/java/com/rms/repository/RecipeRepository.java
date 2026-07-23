package com.rms.repository;

import com.rms.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN r.recipeItems ri " +
            "WHERE r.status != 'DELETED' AND " +
            "(:keyword = '' OR LOWER(r.menuItem.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(ri.ingredient.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:categoryId = -1L OR r.menuItem.category.id = :categoryId)")
    Page<Recipe> searchAndFilter(@Param("keyword") String keyword,
                                 @Param("categoryId") Long categoryId,
                                 Pageable pageable);

    @Query("SELECT r FROM Recipe r WHERE r.menuItem.id = :menuItemId AND r.status != 'DELETED'")
    Optional<Recipe> findActiveRecipeByMenuItemId(@Param("menuItemId") Long menuItemId);
}