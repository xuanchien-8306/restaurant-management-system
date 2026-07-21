package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.FoodDto;
import com.rms.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodDto>>> getAllFoods() {
        List<FoodDto> foods = foodService.getAllFoods();
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", foods));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<FoodDto>>> getFeaturedFoods() {
        List<FoodDto> foods = foodService.getFeaturedFoods();
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", foods));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodDto>> getFoodById(@PathVariable Long id) {
        FoodDto food = foodService.getFoodById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", food));
    }
}