package com.rms.service;

import com.rms.dto.FoodDto;
import com.rms.dto.PageResponse;
import java.math.BigDecimal;

public interface MenuService {
    PageResponse<FoodDto> filterMenu(String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size);
    FoodDto getMenuById(Long id);
}