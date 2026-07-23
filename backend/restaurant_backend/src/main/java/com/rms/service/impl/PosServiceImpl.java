package com.rms.service.impl;

import com.rms.dto.OrderDtos.OrderItemResponse;
import com.rms.dto.OrderDtos.OrderResponse;
import com.rms.dto.PosDtos.AddItemRequest;
import com.rms.dto.PosDtos.PaymentRequest;
import com.rms.dto.PosDtos.UpdateItemRequest;
import com.rms.model.MenuItem;
import com.rms.model.OrderItem;
import com.rms.model.RestaurantOrder;
import com.rms.model.RestaurantTable;
import com.rms.repository.MenuItemRepository;
import com.rms.repository.RestaurantOrderRepository;
import com.rms.repository.RestaurantTableRepository;
import com.rms.service.PosService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosServiceImpl implements PosService {

    private final RestaurantOrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;

    // Inject WebSocket Messaging Template
    private final SimpMessagingTemplate messagingTemplate;

    private final List<String> ACTIVE_STATUSES = Arrays.asList("PENDING", "COOKING", "SERVED");

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getActiveOrderForTable(Long tableId) {
        Optional<RestaurantOrder> activeOrder = orderRepository.findFirstByRestaurantTableIdAndStatusInOrderByIdDesc(tableId, ACTIVE_STATUSES);
        return activeOrder.map(this::mapToDto).orElse(null);
    }

    @Override
    @Transactional
    public OrderResponse addItemToOrder(Long tableId, AddItemRequest request, String staffName) {
        RestaurantTable table = tableRepository.findById(tableId).orElseThrow(() -> new RuntimeException("Bàn không tồn tại"));
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId()).orElseThrow(() -> new RuntimeException("Món ăn không tồn tại"));

        RestaurantOrder order = orderRepository.findFirstByRestaurantTableIdAndStatusInOrderByIdDesc(tableId, ACTIVE_STATUSES)
                .orElseGet(() -> {
                    RestaurantOrder newOrder = new RestaurantOrder();
                    newOrder.setOrderCode("POS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    newOrder.setRestaurantTable(table);
                    newOrder.setOrderType("DINE_IN");
                    newOrder.setStaffName(staffName);
                    newOrder.setStatus("PENDING");
                    table.setStatus("IN_USE");
                    tableRepository.save(table);
                    return orderRepository.save(newOrder);
                });

        Optional<OrderItem> existingItem = order.getOrderItems().stream()
                .filter(i -> i.getMenuItem().getId().equals(menuItem.getId()) && "PENDING".equals(i.getStatus()) &&
                        (request.getNote() == null ? i.getNote() == null : request.getNote().equals(i.getNote())))
                .findFirst();

        if (existingItem.isPresent()) {
            OrderItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            OrderItem newItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(request.getQuantity())
                    .unitPrice(menuItem.getPrice() != null ? menuItem.getPrice() : BigDecimal.ZERO)
                    .note(request.getNote())
                    .status("PENDING")
                    .build();
            order.getOrderItems().add(newItem);
        }

        recalculateTotals(order);
        OrderResponse response = mapToDto(orderRepository.save(order));

        // Bắn tín hiệu WebSocket cho KDS
        messagingTemplate.convertAndSend("/topic/kds", "REFRESH");
        return response;
    }

    @Override
    @Transactional
    public OrderResponse updateOrderItem(Long orderId, Long itemId, UpdateItemRequest request) {
        RestaurantOrder order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        OrderItem item = order.getOrderItems().stream().filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món trong đơn"));

        if (!"PENDING".equals(item.getStatus())) {
            throw new RuntimeException("Không thể sửa số lượng món đã chuyển xuống bếp");
        }

        item.setQuantity(request.getQuantity());
        item.setNote(request.getNote());

        recalculateTotals(order);
        OrderResponse response = mapToDto(orderRepository.save(order));

        messagingTemplate.convertAndSend("/topic/kds", "REFRESH");
        return response;
    }

    @Override
    @Transactional
    public OrderResponse removeOrderItem(Long orderId, Long itemId) {
        RestaurantOrder order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        OrderItem item = order.getOrderItems().stream().filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món trong đơn"));

        if (!"PENDING".equals(item.getStatus())) {
            throw new RuntimeException("Không thể xóa món đã chuyển xuống bếp");
        }

        order.getOrderItems().remove(item);

        if (order.getOrderItems().isEmpty()) {
            order.setStatus("CANCELLED");
            RestaurantTable table = order.getRestaurantTable();
            if (table != null) {
                table.setStatus("AVAILABLE");
                tableRepository.save(table);
            }
        } else {
            recalculateTotals(order);
        }

        OrderResponse response = mapToDto(orderRepository.save(order));
        messagingTemplate.convertAndSend("/topic/kds", "REFRESH");
        return response;
    }

    @Override
    @Transactional
    public OrderResponse sendToKitchen(Long orderId) {
        RestaurantOrder order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Chỉ đơn giản là bắn tín hiệu sang bếp. Bếp sẽ thấy các món PENDING.
        messagingTemplate.convertAndSend("/topic/kds", "REFRESH");
        return mapToDto(order);
    }

    @Override
    @Transactional
    public OrderResponse processPayment(Long orderId, PaymentRequest request) {
        RestaurantOrder order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        order.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        order.setTax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO);
        recalculateTotals(order);

        order.setPaymentMethod(request.getPaymentMethod());
        order.setAmountTendered(request.getAmountTendered());

        if (request.getAmountTendered() != null && request.getAmountTendered().compareTo(order.getTotalAmount()) > 0) {
            order.setChangeAmount(request.getAmountTendered().subtract(order.getTotalAmount()));
        } else {
            order.setChangeAmount(BigDecimal.ZERO);
        }

        if (request.getNote() != null && !request.getNote().isEmpty()) {
            order.setNote(order.getNote() != null ? order.getNote() + " | " + request.getNote() : request.getNote());
        }

        order.setStatus("COMPLETED");

        RestaurantTable table = order.getRestaurantTable();
        if (table != null) {
            table.setStatus("CLEANING");
            tableRepository.save(table);
        }

        OrderResponse response = mapToDto(orderRepository.save(order));
        messagingTemplate.convertAndSend("/topic/kds", "REFRESH");
        return response;
    }

    private void recalculateTotals(RestaurantOrder order) {
        BigDecimal subTotal = BigDecimal.ZERO;
        for (OrderItem item : order.getOrderItems()) {
            BigDecimal lineTotal = item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
            subTotal = subTotal.add(lineTotal);
        }
        order.setSubTotal(subTotal);

        BigDecimal discount = order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax = order.getTax() != null ? order.getTax() : BigDecimal.ZERO;

        BigDecimal total = subTotal.subtract(discount).add(tax);
        order.setTotalAmount(total.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : total);
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
                .tableName(order.getRestaurantTable() != null ? order.getRestaurantTable().getName() : null)
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