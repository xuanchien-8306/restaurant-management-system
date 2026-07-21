package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.OrderDto;
import com.rms.dto.OrderRequest;
import com.rms.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@Valid @RequestBody OrderRequest request, Authentication authentication) {
        OrderDto order = orderService.createOrder(request, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Đặt món thành công", order));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders(Authentication authentication) {
        List<OrderDto> orders = orderService.getMyOrders(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id, Authentication authentication) {
        OrderDto order = orderService.getOrderById(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", order));
    }
}