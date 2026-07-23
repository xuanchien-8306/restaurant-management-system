package com.rms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReportDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiResponse {
        private BigDecimal totalRevenue;
        private BigDecimal totalProfit;
        private Long totalOrders;
        private Long totalCustomers;
        private Long totalReservations;
        private Double revenueGrowthRate; // % tăng trưởng so với kỳ trước
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataResponse {
        private String label;
        private BigDecimal value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopItemResponse {
        private Long itemId;
        private String itemName;
        private String categoryName;
        private Long totalQuantity;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryReportResponse {
        private Long ingredientId;
        private String ingredientName;
        private String unit;
        private Double currentStock;
        private Double minStockLevel;
        private String status; // NORMAL, LOW_STOCK
    }
}