package com.rms.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String orderType;
    private String note;

    @NotEmpty(message = "Giỏ hàng không được trống")
    private List<OrderItemRequest> items;
}