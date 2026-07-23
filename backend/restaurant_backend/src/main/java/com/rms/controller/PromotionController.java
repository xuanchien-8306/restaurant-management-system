package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.PageResponse;
import com.rms.dto.PromotionDtos.*;
import com.rms.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PromotionResponse>>> getPromotions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String promoType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công",
                promotionService.getPromotions(keyword, promoType, status, page, size, sortBy, sortDir)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", promotionService.getPromotionById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm khuyến mãi thành công", promotionService.createPromotion(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(@PathVariable Long id, @Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thành công", promotionService.updatePromotion(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> changeStatus(@PathVariable Long id, @RequestParam String status) {
        promotionService.changeStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái thành công", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa khuyến mãi thành công", null));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ApplyPromotionResponse>> validatePromotion(@Valid @RequestBody ApplyPromotionRequest request) {
        ApplyPromotionResponse response = promotionService.validateAndApplyPromotion(request);
        return ResponseEntity.ok(new ApiResponse<>(response.isSuccess(), response.getMessage(), response));
    }
}