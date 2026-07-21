package com.rms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemRequest {
    @NotNull(message = "Mã món ăn không được để trống")
    private Long menuItemId;

    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private int quantity;

    private String note;

    private BigDecimal unitPrice;
}