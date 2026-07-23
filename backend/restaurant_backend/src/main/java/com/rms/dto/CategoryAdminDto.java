package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CategoryAdminDto {
    private Long id;
    private String name;
    private String description;
    private String status;
    private int menuItemCount;
    private LocalDateTime createdAt;
}