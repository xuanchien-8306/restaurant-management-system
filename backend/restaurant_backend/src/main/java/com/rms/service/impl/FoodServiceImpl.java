package com.rms.service.impl;

import com.rms.dto.FoodDto;
import com.rms.model.MenuItem;
import com.rms.repository.MenuItemRepository;
import com.rms.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final MenuItemRepository menuItemRepository;

    @Override
    public List<FoodDto> getFeaturedFoods() {
        return menuItemRepository.findByStatus("AVAILABLE").stream()
                .limit(8)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FoodDto> getAllFoods() {
        return menuItemRepository.findByStatus("AVAILABLE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public FoodDto getFoodById(Long id) {
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