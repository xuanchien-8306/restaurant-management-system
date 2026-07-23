package com.rms.service;

import com.rms.dto.CategoryDto;
import com.rms.dto.MenuItemAdminDto;
import com.rms.dto.MenuItemRequest;
import com.rms.dto.PageResponse;

import java.util.List;

public interface MenuAdminService {
    PageResponse<MenuItemAdminDto> getMenuItems(String keyword, Long categoryId, String status, int page, int size, String sortBy, String sortDir);
    MenuItemAdminDto getMenuItemById(Long id);
    MenuItemAdminDto createMenuItem(MenuItemRequest request);
    MenuItemAdminDto updateMenuItem(Long id, MenuItemRequest request);
    void toggleMenuItemStatus(Long id);
    void softDeleteMenuItem(Long id);
    List<CategoryDto> getAllCategories();
}