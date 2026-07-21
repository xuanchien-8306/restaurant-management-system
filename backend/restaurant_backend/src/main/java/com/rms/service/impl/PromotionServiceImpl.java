package com.rms.service.impl;

import com.rms.dto.PromotionDto;
import com.rms.repository.PromotionRepository;
import com.rms.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {
    private final PromotionRepository promotionRepository;

    @Override
    public List<PromotionDto> getActivePromotions() {
        return promotionRepository.findByStatus("ACTIVE").stream()
                .map(p -> PromotionDto.builder()
                        .id(p.getId())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .imageUrl(p.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }
}