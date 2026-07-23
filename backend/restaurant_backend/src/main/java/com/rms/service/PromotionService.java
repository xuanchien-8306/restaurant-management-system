package com.rms.service;

import com.rms.dto.PageResponse;
import com.rms.dto.PromotionDtos.*;

import java.util.List;

public interface PromotionService {
    PageResponse<PromotionResponse> getPromotions(String keyword, String promoType, String status, int page, int size, String sortBy, String sortDir);
    PromotionResponse getPromotionById(Long id);
    PromotionResponse createPromotion(PromotionRequest request);
    PromotionResponse updatePromotion(Long id, PromotionRequest request);
    void changeStatus(Long id, String status);
    void deletePromotion(Long id);

    // Tích hợp cho POS và Đơn hàng
    ApplyPromotionResponse validateAndApplyPromotion(ApplyPromotionRequest request);

    List<PromotionResponse> getActivePromotions();
}