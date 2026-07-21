package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderDetailDto {
    private Long id;
    private String foodName;
    private String imageUrl;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}