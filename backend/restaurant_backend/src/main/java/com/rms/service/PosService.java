package com.rms.service;

import com.rms.dto.OrderDtos.OrderResponse;
import com.rms.dto.PosDtos.AddItemRequest;
import com.rms.dto.PosDtos.PaymentRequest;
import com.rms.dto.PosDtos.UpdateItemRequest;

public interface PosService {
    OrderResponse getActiveOrderForTable(Long tableId);
    OrderResponse addItemToOrder(Long tableId, AddItemRequest request, String staffName);
    OrderResponse updateOrderItem(Long orderId, Long itemId, UpdateItemRequest request);
    OrderResponse removeOrderItem(Long orderId, Long itemId);
    OrderResponse sendToKitchen(Long orderId);
    OrderResponse processPayment(Long orderId, PaymentRequest request);
}