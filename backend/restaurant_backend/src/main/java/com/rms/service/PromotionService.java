package com.rms.service;

import com.rms.dto.PromotionDto;
import java.util.List;

public interface PromotionService {
    List<PromotionDto> getActivePromotions();
}