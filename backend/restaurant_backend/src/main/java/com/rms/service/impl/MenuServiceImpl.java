package com.rms.service.impl;

import com.rms.dto.FoodDto;
import com.rms.dto.PageResponse;
import com.rms.model.MenuItem;
import com.rms.repository.MenuItemRepository;
import com.rms.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuItemRepository menuItemRepository;

    @Override
    public PageResponse<FoodDto> filterMenu(String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Handle empty strings
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<MenuItem> menuPage = menuItemRepository.filterMenu(searchKeyword, categoryId, minPrice, maxPrice, pageable);

        return PageResponse.<FoodDto>builder()
                .content(menuPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(menuPage.getNumber())
                .pageSize(menuPage.getSize())
                .totalElements(menuPage.getTotalElements())
                .totalPages(menuPage.getTotalPages())
                .last(menuPage.isLast())
                .build();
    }

    @Override
    public FoodDto getMenuById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));
        return mapToDto(item);
    }

    private FoodDto mapToDto(MenuItem item) {
        return FoodDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .sku(item.getSku())
                .categoryName(item.getCategory().getName())
                .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60")
                .build();
    }
}