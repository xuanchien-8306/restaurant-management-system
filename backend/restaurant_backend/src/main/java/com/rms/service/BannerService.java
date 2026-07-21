package com.rms.service;

import com.rms.dto.BannerDto;
import java.util.List;

public interface BannerService {
    List<BannerDto> getActiveBanners();
}