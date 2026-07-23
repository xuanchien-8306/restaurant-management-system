package com.rms.service;

import com.rms.dto.PageResponse;
import com.rms.dto.OrderDtos.*;
import java.util.Map;

public interface OrderService {
    PageResponse<OrderResponse> getOrders(String keyword, String status, String orderType, int page, int size, String sortBy, String sortDir);
    OrderResponse getOrderById(Long id);
    OrderResponse createOrder(OrderRequest request);
    OrderResponse updateOrder(Long id, OrderRequest request);
    void changeOrderStatus(Long id, String status);
    void cancelOrder(Long id);

    // API hỗ trợ lấy dữ liệu cho dropdown Form
    Map<String, Object> getOrderDependencies();
}