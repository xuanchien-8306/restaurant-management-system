package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.CategoryAdminDto;
import com.rms.dto.CategoryRequest;
import com.rms.dto.PageResponse;
import com.rms.service.CategoryAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class CategoryAdminController {

    private final CategoryAdminService categoryAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CategoryAdminDto>>> getCategories(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        PageResponse<CategoryAdminDto> result = categoryAdminService.getCategories(keyword, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryAdminDto>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", categoryAdminService.getCategoryById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryAdminDto>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm danh mục thành công", categoryAdminService.createCategory(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryAdminDto>> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật danh mục thành công", categoryAdminService.updateCategory(id, request)));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<String>> toggleStatus(@PathVariable Long id) {
        categoryAdminService.toggleCategoryStatus(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thay đổi trạng thái thành công", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id) {
        categoryAdminService.softDeleteCategory(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa danh mục thành công", null));
    }
}