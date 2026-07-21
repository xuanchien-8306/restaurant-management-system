package com.rms.service.impl;

import com.rms.dto.BannerDto;
import com.rms.repository.BannerRepository;
import com.rms.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {
    private final BannerRepository bannerRepository;

    @Override
    public List<BannerDto> getActiveBanners() {
        return bannerRepository.findByStatus("ACTIVE").stream()
                .map(b -> BannerDto.builder()
                        .id(b.getId())
                        .title(b.getTitle())
                        .subtitle(b.getSubtitle())
                        .imageUrl(b.getImageUrl())
                        .buttonText(b.getButtonText())
                        .buttonLink(b.getButtonLink())
                        .build())
                .collect(Collectors.toList());
    }
}