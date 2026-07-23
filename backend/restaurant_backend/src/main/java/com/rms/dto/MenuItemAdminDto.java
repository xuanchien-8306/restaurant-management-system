package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MenuItemAdminDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
}