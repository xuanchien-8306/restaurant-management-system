package com.rms.service.impl;

import com.rms.dto.PageResponse;
import com.rms.dto.OrderDtos.*;
import com.rms.model.*;
import com.rms.repository.*;
import com.rms.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final RestaurantOrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantTableRepository tableRepository;
    // Sử dụng repository của Khách hàng hiện có (hoặc Custom Logic)
    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(String keyword, String status, String orderType, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchKey = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
        String filterStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : "";
        String filterType = (orderType != null && !orderType.trim().isEmpty()) ? orderType.trim() : "";

        Page<RestaurantOrder> orderPage = orderRepository.searchAndFilter(searchKey, filterStatus, filterType, pageable);

        return PageResponse.<OrderResponse>builder()
                .content(orderPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        RestaurantOrder order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        return mapToDto(order);
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        RestaurantOrder order = new RestaurantOrder();
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        mapRequestToEntity(request, order);

        return saveOrderAndItems(order, request.getItems());
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(Long id, OrderRequest request) {
        RestaurantOrder order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if ("COMPLETED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            throw new RuntimeException("Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy");
        }

        mapRequestToEntity(request, order);

        order.getOrderItems().clear();
        orderRepository.saveAndFlush(order); // Xóa item cũ trước khi thêm mới

        return saveOrderAndItems(order, request.getItems());
    }

    @Override
    @Transactional
    public void changeOrderStatus(Long id, String status) {
        RestaurantOrder order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setStatus(status);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        RestaurantOrder order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOrderDependencies() {
        Map<String, Object> map = new HashMap<>();
        map.put("tables", tableRepository.findByStatusNot("DELETED"));
        map.put("customers", customerRepository.findAll()); // Giả định Customer có findAll
        map.put("menuItems", menuItemRepository.findAll().stream().filter(m -> !m.getStatus().equals("DELETED")).collect(Collectors.toList()));
        return map;
    }

    private void mapRequestToEntity(OrderRequest request, RestaurantOrder order) {
        if (request.getCustomerId() != null) {
            order.setCustomer(customerRepository.findById(request.getCustomerId()).orElse(null));
        } else {
            order.setCustomer(null);
        }

        if (request.getTableId() != null) {
            order.setRestaurantTable(tableRepository.findById(request.getTableId()).orElse(null));
        } else {
            order.setRestaurantTable(null);
        }

        order.setStaffName(request.getStaffName());
        order.setOrderType(request.getOrderType());
        order.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        order.setTax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO);
        order.setNote(request.getNote());
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
    }

    private OrderResponse saveOrderAndItems(RestaurantOrder order, List<OrderItemRequest> itemRequests) {
        BigDecimal subTotal = BigDecimal.ZERO;

        for (OrderItemRequest reqItem : itemRequests) {
            MenuItem menuItem = menuItemRepository.findById(reqItem.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại"));

            BigDecimal price = menuItem.getPrice() != null ? menuItem.getPrice() : BigDecimal.ZERO;
            BigDecimal itemTotal = price.multiply(new BigDecimal(reqItem.getQuantity()));
            subTotal = subTotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(reqItem.getQuantity())
                    .unitPrice(price)
                    .note(reqItem.getNote())
                    .build();
            order.getOrderItems().add(orderItem);
        }

        order.setSubTotal(subTotal);

        // Công thức: Total = SubTotal - Discount + Tax
        BigDecimal total = subTotal.subtract(order.getDiscount()).add(order.getTax());
        order.setTotalAmount(total.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : total);

        order = orderRepository.save(order);
        return mapToDto(order);
    }

    private OrderResponse mapToDto(RestaurantOrder order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream().map(oi -> OrderItemResponse.builder()
                .id(oi.getId())
                .menuItemId(oi.getMenuItem().getId())
                .menuItemName(oi.getMenuItem().getName())
                .quantity(oi.getQuantity())
                .unitPrice(oi.getUnitPrice())
                .itemTotal(oi.getUnitPrice().multiply(new BigDecimal(oi.getQuantity())))
                .note(oi.getNote())
                .build()).collect(Collectors.toList());

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