package com.rms.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private RestaurantOrder order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(length = 255)
    private String note;

    // --- TRƯỜNG POS MỚI ---
    @Column(length = 20)
    private String status; // PENDING (Chờ chế biến), COOKING (Đang chế biến), COMPLETED (Hoàn thành), SERVED (Đã phục vụ)

    @PrePersist
    protected void onCreate() {
        if (this.status == null) this.status = "PENDING";
    }
}