package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BannerDto {
    private Long id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String buttonText;
    private String buttonLink;
}