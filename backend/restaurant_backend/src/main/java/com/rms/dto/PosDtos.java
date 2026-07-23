package com.rms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

public class PosDtos {

    @Data
    public static class AddItemRequest {
        @NotNull(message = "Mã món không được để trống")
        private Long menuItemId;
        @Min(value = 1, message = "Số lượng phải >= 1")
        private Integer quantity;
        private String note;
    }

    @Data
    public static class UpdateItemRequest {
        @Min(value = 1, message = "Số lượng phải >= 1")
        private Integer quantity;
        private String note;
    }

    @Data
    public static class PaymentRequest {
        @NotNull(message = "Phương thức thanh toán không được để trống")
        private String paymentMethod;
        private BigDecimal amountTendered;
        private BigDecimal discount;
        private BigDecimal tax;
        private String note;
    }
}