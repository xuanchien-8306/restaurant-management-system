package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.PageResponse;
import com.rms.dto.RecipeDtos.RecipeRequest;
import com.rms.dto.RecipeDtos.RecipeResponse;
import com.rms.model.Ingredient;
import com.rms.model.MenuItem;
import com.rms.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RecipeResponse>>> getRecipes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công",
                recipeService.getRecipes(keyword, categoryId, page, size, sortBy, sortDir)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeResponse>> getRecipeById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", recipeService.getRecipeById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecipeResponse>> createRecipe(@Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm công thức thành công", recipeService.createRecipe(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeResponse>> updateRecipe(@PathVariable Long id, @Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật công thức thành công", recipeService.updateRecipe(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa công thức thành công", null));
    }

    // API hỗ trợ đổ dữ liệu cho Form Frontend
    @GetMapping("/available-menu-items")
    public ResponseEntity<ApiResponse<List<MenuItem>>> getAvailableMenuItems() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", recipeService.getMenuItemsWithoutRecipe()));
    }

    @GetMapping("/ingredients")
    public ResponseEntity<ApiResponse<List<Ingredient>>> getIngredients() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", recipeService.getActiveIngredients()));
    }
}