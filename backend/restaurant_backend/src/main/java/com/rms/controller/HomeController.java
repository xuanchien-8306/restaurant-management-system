package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.BannerDto;
import com.rms.dto.PromotionDto;
import com.rms.service.BannerService;
import com.rms.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final BannerService bannerService;
    private final PromotionService promotionService;

    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<List<BannerDto>>> getBanners() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", bannerService.getActiveBanners()));
    }

    @GetMapping("/promotions")
    public ResponseEntity<ApiResponse<List<PromotionDto>>> getPromotions() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", promotionService.getActivePromotions()));
    }
}