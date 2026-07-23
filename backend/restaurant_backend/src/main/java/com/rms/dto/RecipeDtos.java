package com.rms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class RecipeDtos {

    @Data
    @Builder
    public static class RecipeResponse {
        private Long id;
        private String recipeCode;
        private Long menuItemId;
        private String menuItemName;
        private String categoryName;
        private BigDecimal totalCost;
        private String note;
        private String status;
        private LocalDateTime createdAt;
        private List<RecipeItemResponse> items;
    }

    @Data
    @Builder
    public static class RecipeItemResponse {
        private Long id;
        private Long ingredientId;
        private String ingredientName;
        private String ingredientSku;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal unitCost;
        private BigDecimal itemTotalCost;
    }

    @Data
    public static class RecipeRequest {
        @NotNull(message = "Vui lòng chọn món ăn")
        private Long menuItemId;

        @NotEmpty(message = "Công thức phải có ít nhất 1 nguyên liệu")
        @Valid
        private List<RecipeItemRequest> items;

        private String note;
        private String status;
    }

    @Data
    public static class RecipeItemRequest {
        @NotNull(message = "Vui lòng chọn nguyên liệu")
        private Long ingredientId;

        @NotNull(message = "Vui lòng nhập định lượng")
        @DecimalMin(value = "0.001", message = "Định lượng phải lớn hơn 0")
        private BigDecimal quantity;
    }
}