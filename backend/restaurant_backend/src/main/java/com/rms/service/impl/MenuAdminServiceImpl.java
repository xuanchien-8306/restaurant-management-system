package com.rms.service.impl;

import com.rms.dto.CategoryDto;
import com.rms.dto.MenuItemAdminDto;
import com.rms.dto.MenuItemRequest;
import com.rms.dto.PageResponse;
import com.rms.model.Category;
import com.rms.model.MenuItem;
import com.rms.repository.CategoryRepository;
import com.rms.repository.MenuItemRepository;
import com.rms.service.MenuAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuAdminServiceImpl implements MenuAdminService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public PageResponse<MenuItemAdminDto> getMenuItems(String keyword, Long categoryId, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<MenuItem> itemPage = menuItemRepository.filterMenuAdmin(searchKeyword, categoryId, status, pageable);

        return PageResponse.<MenuItemAdminDto>builder()
                .content(itemPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(itemPage.getNumber())
                .pageSize(itemPage.getSize())
                .totalElements(itemPage.getTotalElements())
                .totalPages(itemPage.getTotalPages())
                .last(itemPage.isLast())
                .build();
    }

    @Override
    public MenuItemAdminDto getMenuItemById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));
        return mapToDto(item);
    }

    @Override
    @Transactional
    public MenuItemAdminDto createMenuItem(MenuItemRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        MenuItem item = MenuItem.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .sku("M-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .status(request.getStatus() != null ? request.getStatus() : "AVAILABLE")
                .build();

        item = menuItemRepository.save(item);
        return mapToDto(item);
    }

    @Override
    @Transactional
    public MenuItemAdminDto updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        item.setCategory(category);
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        }

        item = menuItemRepository.save(item);
        return mapToDto(item);
    }

    @Override
    @Transactional
    public void toggleMenuItemStatus(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));

        item.setStatus("UNAVAILABLE".equals(item.getStatus()) ? "AVAILABLE" : "UNAVAILABLE");
        menuItemRepository.save(item);
    }

    @Override
    @Transactional
    public void softDeleteMenuItem(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));
        item.setStatus("DELETED");
        menuItemRepository.save(item);
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findByStatusNot("DELETED").stream().map(c -> CategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .status(c.getStatus())
                .build()).collect(Collectors.toList());
    }

    private MenuItemAdminDto mapToDto(MenuItem item) {
        return MenuItemAdminDto.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .sku(item.getSku())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .build();
    }
}