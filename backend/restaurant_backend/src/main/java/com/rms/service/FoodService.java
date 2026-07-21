package com.rms.service;

import com.rms.dto.FoodDto;
import java.util.List;

public interface FoodService {
    List<FoodDto> getFeaturedFoods();
    List<FoodDto> getAllFoods();
    FoodDto getFoodById(Long id);
}