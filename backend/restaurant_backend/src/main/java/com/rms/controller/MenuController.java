package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.FoodDto;
import com.rms.dto.PageResponse;
import com.rms.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<FoodDto>>> getMenu(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        PageResponse<FoodDto> result = menuService.filterMenu(keyword, category, minPrice, maxPrice, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodDto>> getMenuById(@PathVariable Long id) {
        FoodDto food = menuService.getMenuById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", food));
    }
}