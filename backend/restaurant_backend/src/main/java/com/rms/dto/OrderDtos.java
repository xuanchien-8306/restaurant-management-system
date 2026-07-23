package com.rms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDtos {

    @Data
    @Builder
    public static class OrderResponse {
        private Long id;
        private String orderCode;
        private Long customerId;
        private String customerName;
        private Long tableId;
        private String tableName;
        private String staffName;
        private String orderType;
        private BigDecimal subTotal;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal totalAmount;
        private String note;
        private String status;
        private LocalDateTime createdAt;
        private List<OrderItemResponse> items;
    }

    @Data
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long menuItemId;
        private String menuItemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal itemTotal;
        private String note;
    }

    @Data
    public static class OrderRequest {
        private Long customerId;
        private Long tableId;

        @NotBlank(message = "Tên nhân viên không được để trống")
        private String staffName;

        @NotBlank(message = "Loại đơn hàng không được để trống")
        private String orderType;

        @NotEmpty(message = "Đơn hàng phải có ít nhất 1 món")
        @Valid
        private List<OrderItemRequest> items;

        private BigDecimal discount;
        private BigDecimal tax;
        private String note;
        private String status;
    }

    @Data
    public static class OrderItemRequest {
        @NotNull(message = "Vui lòng chọn món ăn")
        private Long menuItemId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer quantity;

        private String note;
    }
}