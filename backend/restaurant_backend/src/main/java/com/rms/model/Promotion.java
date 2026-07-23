package com.rms.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "promo_code", nullable = false, unique = true, length = 50)
    private String promoCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "promo_type", nullable = false, length = 50)
    private String promoType; // PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y

    @Column(name = "discount_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_value", precision = 15, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "max_discount_value", precision = 15, scale = 2)
    private BigDecimal maxDiscountValue; // Dùng cho loại PERCENTAGE

    @Column(name = "usage_limit")
    private Integer usageLimit; // Tổng số lượt sử dụng

    @Column(name = "used_count")
    private Integer usedCount; // Số lượt đã sử dụng

    @Column(name = "usage_per_customer")
    private Integer usagePerCustomer; // Số lượt dùng mỗi khách

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "apply_scope", length = 50)
    private String applyScope; // ALL, CATEGORY, MENU_ITEM

    @Column(name = "apply_scope_ids", length = 255)
    private String applyScopeIds; // Lưu chuỗi ID cách nhau bằng dấu phẩy

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String status; // ACTIVE, PAUSED, EXPIRED, DELETED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.usedCount == null) this.usedCount = 0;
        if (this.status == null) this.status = "ACTIVE";
        checkAndSetExpired();
    }

    @PreUpdate
    protected void onUpdate() {
        checkAndSetExpired();
    }

    private void checkAndSetExpired() {
        if (!"DELETED".equals(this.status) && !"PAUSED".equals(this.status)) {
            if (LocalDateTime.now().isAfter(this.endDate) || (this.usageLimit != null && this.usedCount >= this.usageLimit)) {
                this.status = "EXPIRED";
            } else if (LocalDateTime.now().isBefore(this.startDate)) {
                this.status = "PAUSED"; // Chưa tới ngày thì có thể để PAUSED hoặc SCHEDULED
            } else {
                this.status = "ACTIVE";
            }
        }
    }
}