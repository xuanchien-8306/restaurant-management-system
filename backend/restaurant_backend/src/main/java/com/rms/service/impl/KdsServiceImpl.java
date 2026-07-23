package com.rms.service.impl;

import com.rms.dto.OrderDtos.OrderItemResponse;
import com.rms.dto.OrderDtos.OrderResponse;
import com.rms.model.OrderItem;
import com.rms.model.RestaurantOrder;
import com.rms.repository.RestaurantOrderRepository;
import com.rms.service.KdsService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KdsServiceImpl implements KdsService {

    private final RestaurantOrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveKitchenOrders() {
        // Lấy tất cả hóa đơn chưa hoàn thành hoặc chưa hủy
        List<RestaurantOrder> orders = orderRepository.findAll().stream()
                .filter(o -> Arrays.asList("PENDING", "COOKING", "SERVED").contains(o.getStatus()))
                .collect(Collectors.toList());
        return orders.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateItemStatus(Long orderId, Long itemId, String status) {
        RestaurantOrder order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        OrderItem item = order.getOrderItems().stream()
                .filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));

        item.setStatus(status);

        // Tự động kiểm tra trạng thái toàn bộ hóa đơn
        boolean allCompletedOrServed = order.getOrderItems().stream()
                .allMatch(i -> Arrays.asList("COMPLETED", "SERVED").contains(i.getStatus()));
        boolean anyCooking = order.getOrderItems().stream()
                .anyMatch(i -> "COOKING".equals(i.getStatus()));

        if (allCompletedOrServed) {
            order.setStatus("SERVED"); // Bếp nấu xong thì chuyển sang Đã phục vụ/Chờ ra món
        } else if (anyCooking && "PENDING".equals(order.getStatus())) {
            order.setStatus("COOKING");
        }

        orderRepository.save(order);
        messagingTemplate.convertAndSend("/topic/kds", "REFRESH"); // Đồng bộ Realtime
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, String status) {
        RestaurantOrder order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setStatus(status);

        // Nếu đánh dấu toàn đơn là COMPLETED/SERVED, cập nhật toàn bộ món bên trong
        if (Arrays.asList("COMPLETED", "SERVED").contains(status)) {
            order.getOrderItems().forEach(i -> i.setStatus(status));
        }

        orderRepository.save(order);
        messagingTemplate.convertAndSend("/topic/kds", "REFRESH"); // Đồng bộ Realtime
    }

    private OrderResponse mapToDto(RestaurantOrder order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream().map(oi -> {
            OrderItemResponse itemDto = OrderItemResponse.builder()
                    .id(oi.getId())
                    .menuItemId(oi.getMenuItem().getId())
                    .menuItemName(oi.getMenuItem().getName())
                    .quantity(oi.getQuantity())
                    .unitPrice(oi.getUnitPrice())
                    .itemTotal(oi.getUnitPrice().multiply(new BigDecimal(oi.getQuantity())))
                    .note(oi.getNote())
                    .build();
            itemDto.setNote(oi.getStatus() + (oi.getNote() != null ? "|" + oi.getNote() : "|"));
            return itemDto;
        }).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách vãng lai")
                .tableId(order.getRestaurantTable() != null ? order.getRestaurantTable().getId() : null)
                .tableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : "Mang về/Giao hàng")
                .staffName(order.getStaffName())
                .orderType(order.getOrderType())
                .subTotal(order.getSubTotal())
                .discount(order.getDiscount())
                .tax(order.getTax())
                .totalAmount(order.getTotalAmount())
                .note(order.getNote())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}