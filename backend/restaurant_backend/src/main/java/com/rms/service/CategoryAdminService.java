package com.rms.service;

import com.rms.dto.CategoryAdminDto;
import com.rms.dto.CategoryRequest;
import com.rms.dto.PageResponse;

public interface CategoryAdminService {
    PageResponse<CategoryAdminDto> getCategories(String keyword, String status, int page, int size, String sortBy, String sortDir);
    CategoryAdminDto getCategoryById(Long id);
    CategoryAdminDto createCategory(CategoryRequest request);
    CategoryAdminDto updateCategory(Long id, CategoryRequest request);
    void toggleCategoryStatus(Long id);
    void softDeleteCategory(Long id);
}
