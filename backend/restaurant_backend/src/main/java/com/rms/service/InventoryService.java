package com.rms.service;

import com.rms.dto.InventoryDtos.*;
import com.rms.dto.PageResponse;
import com.rms.model.IngredientCategory;
import com.rms.model.Supplier;

import java.util.List;

public interface InventoryService {
    PageResponse<IngredientDto> getIngredients(String keyword, Long categoryId, Long supplierId, String status, int page, int size, String sortBy, String sortDir);
    IngredientDto getIngredientById(Long id);
    IngredientDto createIngredient(IngredientRequest request);
    IngredientDto updateIngredient(Long id, IngredientRequest request);
    void deleteIngredient(Long id);

    void processStockAction(Long ingredientId, StockActionRequest request, String username);
    List<InventoryLogDto> getIngredientHistory(Long ingredientId);

    List<Supplier> getActiveSuppliers();
    List<IngredientCategory> getActiveCategories();
}