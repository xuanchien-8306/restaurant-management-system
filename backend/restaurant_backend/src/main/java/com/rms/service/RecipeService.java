package com.rms.service;

import com.rms.dto.PageResponse;
import com.rms.dto.RecipeDtos.RecipeRequest;
import com.rms.dto.RecipeDtos.RecipeResponse;
import com.rms.model.Ingredient;
import com.rms.model.MenuItem;

import java.util.List;

public interface RecipeService {
    PageResponse<RecipeResponse> getRecipes(String keyword, Long categoryId, int page, int size, String sortBy, String sortDir);
    RecipeResponse getRecipeById(Long id);
    RecipeResponse createRecipe(RecipeRequest request);
    RecipeResponse updateRecipe(Long id, RecipeRequest request);
    void deleteRecipe(Long id);

    // Hỗ trợ cho form Frontend
    List<MenuItem> getMenuItemsWithoutRecipe();
    List<Ingredient> getActiveIngredients();
}