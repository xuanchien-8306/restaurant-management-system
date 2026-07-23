package com.rms.service.impl;

import com.rms.dto.PageResponse;
import com.rms.dto.RecipeDtos.*;
import com.rms.model.Ingredient;
import com.rms.model.MenuItem;
import com.rms.model.Recipe;
import com.rms.model.RecipeItem;
import com.rms.repository.IngredientRepository;
import com.rms.repository.MenuItemRepository;
import com.rms.repository.RecipeRepository;
import com.rms.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final MenuItemRepository menuItemRepository;
    private final IngredientRepository ingredientRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RecipeResponse> getRecipes(String keyword, Long categoryId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchKey = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
        Long filterCategory = (categoryId != null) ? categoryId : -1L;

        Page<Recipe> recipePage = recipeRepository.searchAndFilter(searchKey, filterCategory, pageable);

        return PageResponse.<RecipeResponse>builder()
                .content(recipePage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(recipePage.getNumber())
                .pageSize(recipePage.getSize())
                .totalElements(recipePage.getTotalElements())
                .totalPages(recipePage.getTotalPages())
                .last(recipePage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeResponse getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy công thức"));
        return mapToDto(recipe);
    }

    @Override
    @Transactional
    public RecipeResponse createRecipe(RecipeRequest request) {
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại"));

        if (recipeRepository.findActiveRecipeByMenuItemId(menuItem.getId()).isPresent()) {
            throw new RuntimeException("Món ăn này đã có công thức. Vui lòng cập nhật thay vì tạo mới.");
        }

        Recipe recipe = Recipe.builder()
                .recipeCode("RC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .menuItem(menuItem)
                .note(request.getNote())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .totalCost(BigDecimal.ZERO)
                .build();

        return saveRecipeAndItems(recipe, request.getItems());
    }

    @Override
    @Transactional
    public RecipeResponse updateRecipe(Long id, RecipeRequest request) {
        Recipe recipe = recipeRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy công thức"));

        if (!recipe.getMenuItem().getId().equals(request.getMenuItemId())) {
            MenuItem newMenuItem = menuItemRepository.findById(request.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại"));

            Optional<Recipe> exist = recipeRepository.findActiveRecipeByMenuItemId(newMenuItem.getId());
            if (exist.isPresent() && !exist.get().getId().equals(recipe.getId())) {
                throw new RuntimeException("Món ăn mới đã có công thức khác.");
            }
            recipe.setMenuItem(newMenuItem);
        }

        recipe.setNote(request.getNote());
        recipe.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        recipe.getRecipeItems().clear();
        // FIX LỖI: Ép Hibernate thực thi lệnh XÓA nguyên liệu cũ xuống Database ngay lập tức
        recipeRepository.saveAndFlush(recipe);

        return saveRecipeAndItems(recipe, request.getItems());
    }

    @Override
    @Transactional
    public void deleteRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy công thức"));
        recipe.setStatus("DELETED");
        recipeRepository.save(recipe);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItem> getMenuItemsWithoutRecipe() {
        return menuItemRepository.findAll().stream()
                .filter(m -> !m.getStatus().equals("DELETED") && recipeRepository.findActiveRecipeByMenuItemId(m.getId()).isEmpty())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ingredient> getActiveIngredients() {
        return ingredientRepository.findAll().stream()
                .filter(i -> !i.getStatus().equals("DELETED"))
                .collect(Collectors.toList());
    }

    private RecipeResponse saveRecipeAndItems(Recipe recipe, List<RecipeItemRequest> itemRequests) {
        Set<Long> uniqueIngredients = new HashSet<>();
        BigDecimal totalCost = BigDecimal.ZERO;

        for (RecipeItemRequest reqItem : itemRequests) {
            if (!uniqueIngredients.add(reqItem.getIngredientId())) {
                throw new RuntimeException("Không được chọn trùng nguyên liệu trong cùng một công thức!");
            }

            Ingredient ingredient = ingredientRepository.findById(reqItem.getIngredientId())
                    .orElseThrow(() -> new RuntimeException("Nguyên liệu ID " + reqItem.getIngredientId() + " không tồn tại"));

            BigDecimal importPrice = ingredient.getImportPrice() != null ? ingredient.getImportPrice() : BigDecimal.ZERO;
            BigDecimal itemCost = importPrice.multiply(reqItem.getQuantity());
            totalCost = totalCost.add(itemCost);

            RecipeItem recipeItem = RecipeItem.builder()
                    .recipe(recipe)
                    .ingredient(ingredient)
                    .quantity(reqItem.getQuantity())
                    .unit(ingredient.getUnit()) // Kế thừa unit từ kho
                    .build();
            recipe.getRecipeItems().add(recipeItem);
        }

        recipe.setTotalCost(totalCost);
        recipe = recipeRepository.save(recipe);
        return mapToDto(recipe);
    }

    private RecipeResponse mapToDto(Recipe recipe) {
        List<RecipeItemResponse> itemResponses = recipe.getRecipeItems().stream().map(ri -> {
            BigDecimal price = ri.getIngredient().getImportPrice() != null ? ri.getIngredient().getImportPrice() : BigDecimal.ZERO;
            return RecipeItemResponse.builder()
                    .id(ri.getId())
                    .ingredientId(ri.getIngredient().getId())
                    .ingredientName(ri.getIngredient().getName())
                    .ingredientSku(ri.getIngredient().getSku())
                    .quantity(ri.getQuantity())
                    .unit(ri.getUnit())
                    .unitCost(price)
                    .itemTotalCost(price.multiply(ri.getQuantity()))
                    .build();
        }).collect(Collectors.toList());

        return RecipeResponse.builder()
                .id(recipe.getId())
                .recipeCode(recipe.getRecipeCode())
                .menuItemId(recipe.getMenuItem().getId())
                .menuItemName(recipe.getMenuItem().getName())
                .categoryName(recipe.getMenuItem().getCategory().getName())
                .totalCost(recipe.getTotalCost())
                .note(recipe.getNote())
                .status(recipe.getStatus())
                .createdAt(recipe.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}