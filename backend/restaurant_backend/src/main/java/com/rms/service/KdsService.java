package com.rms.service;

import com.rms.dto.OrderDtos.OrderResponse;
import java.util.List;

public interface KdsService {
    List<OrderResponse> getActiveKitchenOrders();
    void updateItemStatus(Long orderId, Long itemId, String status);
    void updateOrderStatus(Long orderId, String status);
}