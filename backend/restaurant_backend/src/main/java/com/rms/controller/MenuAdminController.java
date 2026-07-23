package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.CategoryDto;
import com.rms.dto.MenuItemAdminDto;
import com.rms.dto.MenuItemRequest;
import com.rms.dto.PageResponse;
import com.rms.service.MenuAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/menu")
@RequiredArgsConstructor
public class MenuAdminController {

    private final MenuAdminService menuAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MenuItemAdminDto>>> getMenuItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        PageResponse<MenuItemAdminDto> result = menuAdminService.getMenuItems(keyword, categoryId, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", result));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", menuAdminService.getAllCategories()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemAdminDto>> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", menuAdminService.getMenuItemById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuItemAdminDto>> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm món ăn thành công", menuAdminService.createMenuItem(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemAdminDto>> updateMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật món ăn thành công", menuAdminService.updateMenuItem(id, request)));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<String>> toggleStatus(@PathVariable Long id) {
        menuAdminService.toggleMenuItemStatus(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thay đổi trạng thái thành công", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMenuItem(@PathVariable Long id) {
        menuAdminService.softDeleteMenuItem(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa món ăn thành công", null));
    }
}