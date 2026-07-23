package com.rms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PromotionDtos {

    @Data
    @Builder
    public static class PromotionResponse {
        private Long id;
        private String promoCode;
        private String name;
        private String promoType;
        private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountValue;
        private Integer usageLimit;
        private Integer usedCount;
        private Integer usagePerCustomer;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String applyScope;
        private List<String> applyScopeIds;
        private String description;
        private String status;
    }

    @Data
    public static class PromotionRequest {
        @NotBlank(message = "Mã khuyến mãi không được trống")
        private String promoCode;
        @NotBlank(message = "Tên chương trình không được trống")
        private String name;
        @NotBlank(message = "Loại khuyến mãi không được trống")
        private String promoType;
        @NotNull(message = "Giá trị giảm không được trống")
        private BigDecimal discountValue;

        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountValue;
        private Integer usageLimit;
        private Integer usagePerCustomer;

        @NotNull(message = "Ngày bắt đầu không được trống")
        private LocalDateTime startDate;
        @NotNull(message = "Ngày kết thúc không được trống")
        private LocalDateTime endDate;

        private String applyScope;
        private List<String> applyScopeIds;
        private String description;
        private String status;
    }

    // Dùng để Validate và tính toán giảm giá từ POS/Order
    @Data
    public static class ApplyPromotionRequest {
        @NotBlank(message = "Mã khuyến mãi không được trống")
        private String promoCode;
        @NotNull(message = "Tổng tiền đơn hàng không được trống")
        private BigDecimal orderTotal;
        private Long customerId;
        private List<Long> itemIds; // Danh sách ID món ăn trong đơn
    }

    @Data
    @Builder
    public static class ApplyPromotionResponse {
        private boolean success;
        private String message;
        private BigDecimal discountAmount;
        private BigDecimal finalTotal;
    }
}