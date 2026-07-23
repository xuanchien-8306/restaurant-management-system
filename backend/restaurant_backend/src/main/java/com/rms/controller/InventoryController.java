package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.InventoryDtos.*;
import com.rms.dto.PageResponse;
import com.rms.model.IngredientCategory;
import com.rms.model.Supplier;
import com.rms.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/ingredients")
    public ResponseEntity<ApiResponse<PageResponse<IngredientDto>>> getIngredients(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công",
                inventoryService.getIngredients(keyword, categoryId, supplierId, status, page, size, sortBy, sortDir)));
    }

    @PostMapping("/ingredients")
    public ResponseEntity<ApiResponse<IngredientDto>> createIngredient(@Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm nguyên liệu thành công", inventoryService.createIngredient(request)));
    }

    @PutMapping("/ingredients/{id}")
    public ResponseEntity<ApiResponse<IngredientDto>> updateIngredient(@PathVariable Long id, @Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật nguyên liệu thành công", inventoryService.updateIngredient(id, request)));
    }

    @DeleteMapping("/ingredients/{id}")
    public ResponseEntity<ApiResponse<String>> deleteIngredient(@PathVariable Long id) {
        inventoryService.deleteIngredient(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa nguyên liệu thành công", null));
    }

    @PostMapping("/ingredients/{id}/stock")
    public ResponseEntity<ApiResponse<String>> processStockAction(@PathVariable Long id, @Valid @RequestBody StockActionRequest request, Authentication auth) {
        inventoryService.processStockAction(id, request, auth.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật kho thành công", null));
    }

    @GetMapping("/ingredients/{id}/history")
    public ResponseEntity<ApiResponse<List<InventoryLogDto>>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", inventoryService.getIngredientHistory(id)));
    }

    @GetMapping("/suppliers")
    public ResponseEntity<ApiResponse<List<Supplier>>> getSuppliers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", inventoryService.getActiveSuppliers()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<IngredientCategory>>> getCategories() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", inventoryService.getActiveCategories()));
    }
}