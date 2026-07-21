package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class FoodDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String sku;
    private String categoryName;
    private String imageUrl; // Placeholder
}