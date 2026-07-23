package com.rms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class InventoryDtos {

    @Data
    @Builder
    public static class IngredientDto {
        private Long id;
        private String sku;
        private String name;
        private Long categoryId;
        private String categoryName;
        private Long supplierId;
        private String supplierName;
        private String unit;
        private BigDecimal importPrice;
        private BigDecimal stockQuantity;
        private BigDecimal minStock;
        private LocalDate importDate;
        private LocalDate expiryDate;
        private String note;
        private String status;
        private boolean isLowStock;
        private boolean isExpiring;
    }

    @Data
    public static class IngredientRequest {
        @NotBlank(message = "Mã nguyên liệu không được để trống")
        private String sku;
        @NotBlank(message = "Tên nguyên liệu không được để trống")
        private String name;
        private Long categoryId;
        private Long supplierId;
        @NotBlank(message = "Đơn vị tính không được để trống")
        private String unit;
        private BigDecimal importPrice;
        private BigDecimal stockQuantity;
        private BigDecimal minStock;
        private LocalDate importDate;
        private LocalDate expiryDate;
        private String note;
        private String status;
    }

    @Data
    public static class StockActionRequest {
        @NotNull(message = "Loại hành động không được để trống")
        private String type; // IMPORT or EXPORT
        @NotNull(message = "Số lượng không được để trống")
        @DecimalMin(value = "0.01", message = "Số lượng phải lớn hơn 0")
        private BigDecimal quantity;
        private String note;
    }

    @Data
    @Builder
    public static class InventoryLogDto {
        private Long id;
        private String logType;
        private BigDecimal quantity;
        private String note;
        private String createdBy;
        private LocalDateTime createdAt;
    }
}