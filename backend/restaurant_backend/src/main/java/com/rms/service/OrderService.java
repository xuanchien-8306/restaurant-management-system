package com.rms.service;

import com.rms.dto.OrderDto;
import com.rms.dto.OrderRequest;
import java.util.List;

public interface OrderService {
    OrderDto createOrder(OrderRequest request, String username);
    List<OrderDto> getMyOrders(String username);
    OrderDto getOrderById(Long orderId, String username);
}