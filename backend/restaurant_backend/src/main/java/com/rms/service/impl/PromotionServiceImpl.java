package com.rms.service.impl;

import com.rms.dto.PageResponse;
import com.rms.dto.PromotionDtos.*;
import com.rms.model.Promotion;
import com.rms.repository.PromotionRepository;
import com.rms.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionResponse> getPromotions(String keyword, String promoType, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchKey = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
        String filterType = (promoType != null && !promoType.trim().isEmpty()) ? promoType.trim() : "";
        String filterStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : "";

        Page<Promotion> promoPage = promotionRepository.searchAndFilter(searchKey, filterType, filterStatus, pageable);

        return PageResponse.<PromotionResponse>builder()
                .content(promoPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(promoPage.getNumber())
                .pageSize(promoPage.getSize())
                .totalElements(promoPage.getTotalElements())
                .totalPages(promoPage.getTotalPages())
                .last(promoPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getPromotionById(Long id) {
        return mapToDto(promotionRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi")));
    }

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        if (promotionRepository.findByPromoCodeAndStatusNot(request.getPromoCode(), "DELETED").isPresent()) {
            throw new RuntimeException("Mã khuyến mãi đã tồn tại!");
        }

        Promotion promotion = new Promotion();
        mapRequestToEntity(request, promotion);

        return mapToDto(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi"));

        Optional<Promotion> exist = promotionRepository.findByPromoCodeAndStatusNot(request.getPromoCode(), "DELETED");
        if (exist.isPresent() && !exist.get().getId().equals(id)) {
            throw new RuntimeException("Mã khuyến mãi đã tồn tại ở chương trình khác!");
        }

        mapRequestToEntity(request, promotion);

        return mapToDto(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public void changeStatus(Long id, String status) {
        Promotion promotion = promotionRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi"));
        promotion.setStatus(status);
        promotionRepository.save(promotion);
    }

    @Override
    @Transactional
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi"));
        promotion.setStatus("DELETED");
        promotionRepository.save(promotion);
    }

    @Override
    @Transactional
    public ApplyPromotionResponse validateAndApplyPromotion(ApplyPromotionRequest request) {
        Optional<Promotion> opt = promotionRepository.findByPromoCodeAndStatusNot(request.getPromoCode(), "DELETED");
        if (opt.isEmpty()) {
            return ApplyPromotionResponse.builder().success(false).message("Mã khuyến mãi không tồn tại").build();
        }

        Promotion promo = opt.get();
        LocalDateTime now = LocalDateTime.now();

        // 1. Kiểm tra trạng thái và thời gian
        if (!"ACTIVE".equals(promo.getStatus())) {
            return ApplyPromotionResponse.builder().success(false).message("Mã khuyến mãi không trong trạng thái hoạt động").build();
        }
        if (now.isBefore(promo.getStartDate()) || now.isAfter(promo.getEndDate())) {
            return ApplyPromotionResponse.builder().success(false).message("Mã khuyến mãi đã hết hạn hoặc chưa bắt đầu").build();
        }

        // 2. Kiểm tra lượt sử dụng
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            return ApplyPromotionResponse.builder().success(false).message("Mã khuyến mãi đã hết lượt sử dụng").build();
        }

        // 3. Kiểm tra giá trị đơn tối thiểu
        if (promo.getMinOrderValue() != null && request.getOrderTotal().compareTo(promo.getMinOrderValue()) < 0) {
            return ApplyPromotionResponse.builder().success(false).message("Đơn hàng chưa đạt giá trị tối thiểu: " + promo.getMinOrderValue()).build();
        }

        // 4. Tính toán số tiền giảm
        BigDecimal discountAmount = BigDecimal.ZERO;

        // (Tương lai mở rộng: Kiểm tra applyScope với request.getItemIds() ở đây. Hiện tại tính trên tổng hóa đơn)

        if ("PERCENTAGE".equals(promo.getPromoType())) {
            discountAmount = request.getOrderTotal().multiply(promo.getDiscountValue()).divide(new BigDecimal(100));
            if (promo.getMaxDiscountValue() != null && discountAmount.compareTo(promo.getMaxDiscountValue()) > 0) {
                discountAmount = promo.getMaxDiscountValue();
            }
        } else if ("FIXED_AMOUNT".equals(promo.getPromoType())) {
            discountAmount = promo.getDiscountValue();
        }

        if (discountAmount.compareTo(request.getOrderTotal()) > 0) {
            discountAmount = request.getOrderTotal(); // Không giảm quá tổng tiền
        }

        BigDecimal finalTotal = request.getOrderTotal().subtract(discountAmount);

        // Ghi nhận lượt sử dụng (Nếu đây là hàm Apply thực sự lúc thanh toán, còn nếu chỉ Check thì tách riêng.
        // Ở đây tự động tăng khi Validate thành công giả định gọi từ bước Thanh toán).
        promo.setUsedCount(promo.getUsedCount() + 1);
        promotionRepository.save(promo);

        return ApplyPromotionResponse.builder()
                .success(true)
                .message("Áp dụng mã thành công!")
                .discountAmount(discountAmount)
                .finalTotal(finalTotal)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getActivePromotions() {
        return promotionRepository.findAll().stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void mapRequestToEntity(PromotionRequest request, Promotion promotion) {
        promotion.setPromoCode(request.getPromoCode().toUpperCase());
        promotion.setName(request.getName());
        promotion.setPromoType(request.getPromoType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMinOrderValue(request.getMinOrderValue());
        promotion.setMaxDiscountValue(request.getMaxDiscountValue());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setUsagePerCustomer(request.getUsagePerCustomer());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setApplyScope(request.getApplyScope() != null ? request.getApplyScope() : "ALL");

        if (request.getApplyScopeIds() != null && !request.getApplyScopeIds().isEmpty()) {
            promotion.setApplyScopeIds(String.join(",", request.getApplyScopeIds()));
        } else {
            promotion.setApplyScopeIds(null);
        }

        promotion.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            promotion.setStatus(request.getStatus());
        }
    }

    private PromotionResponse mapToDto(Promotion p) {
        List<String> scopeIds = null;
        if (p.getApplyScopeIds() != null && !p.getApplyScopeIds().isEmpty()) {
            scopeIds = Arrays.asList(p.getApplyScopeIds().split(","));
        }

        return PromotionResponse.builder()
                .id(p.getId())
                .promoCode(p.getPromoCode())
                .name(p.getName())
                .promoType(p.getPromoType())
                .discountValue(p.getDiscountValue())
                .minOrderValue(p.getMinOrderValue())
                .maxDiscountValue(p.getMaxDiscountValue())
                .usageLimit(p.getUsageLimit())
                .usedCount(p.getUsedCount())
                .usagePerCustomer(p.getUsagePerCustomer())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .applyScope(p.getApplyScope())
                .applyScopeIds(scopeIds)
                .description(p.getDescription())
                .status(p.getStatus())
                .build();
    }
}