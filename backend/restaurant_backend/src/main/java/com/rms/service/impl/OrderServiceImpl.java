package com.rms.service.impl;

import com.rms.dto.OrderDetailDto;
import com.rms.dto.OrderDto;
import com.rms.dto.OrderItemRequest;
import com.rms.dto.OrderRequest;
import com.rms.model.Account;
import com.rms.model.MenuItem;
import com.rms.model.Order;
import com.rms.model.OrderDetail;
import com.rms.repository.AccountRepository;
import com.rms.repository.MenuItemRepository;
import com.rms.repository.OrderRepository;
import com.rms.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    @Transactional
    public OrderDto createOrder(OrderRequest request, String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Order order = Order.builder()
                .customer(account.getCustomer())
                .orderType(request.getOrderType() != null ? request.getOrderType() : "ONLINE")
                .status("PENDING")
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn: " + itemReq.getMenuItemId()));

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .note(itemReq.getNote())
                    .build();

            details.add(detail);
            totalAmount = totalAmount.add(menuItem.getPrice().multiply(new BigDecimal(itemReq.getQuantity())));
        }

        order.setOrderDetails(details);
        order.setTotalAmount(totalAmount);

        order = orderRepository.save(order);
        return mapToDto(order);
    }

    @Override
    public List<OrderDto> getMyOrders(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(account.getCustomer().getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDto getOrderById(Long orderId, String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Order order = orderRepository.findByIdAndCustomerId(orderId, account.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này"));

        return mapToDto(order);
    }

    private OrderDto mapToDto(Order order) {
        List<OrderDetailDto> itemDtos = null;
        if (order.getOrderDetails() != null) {
            itemDtos = order.getOrderDetails().stream().map(detail -> OrderDetailDto.builder()
                    .id(detail.getId())
                    .foodName(detail.getMenuItem().getName())
                    .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80")
                    .quantity(detail.getQuantity())
                    .unitPrice(detail.getUnitPrice())
                    .totalPrice(detail.getUnitPrice().multiply(new BigDecimal(detail.getQuantity())))
                    .build()).collect(Collectors.toList());
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderType(order.getOrderType())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}