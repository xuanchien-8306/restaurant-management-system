package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.PageResponse;
import com.rms.dto.OrderDtos.*;
import com.rms.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String orderType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công",
                orderService.getOrders(keyword, status, orderType, page, size, sortBy, sortDir)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", orderService.getOrderById(id)));
    }

    @GetMapping("/dependencies")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDependencies() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", orderService.getOrderDependencies()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo đơn hàng thành công", orderService.createOrder(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(@PathVariable Long id, @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật đơn hàng thành công", orderService.updateOrder(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> changeStatus(@PathVariable Long id, @RequestParam String status) {
        orderService.changeOrderStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái thành công", null));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Hủy đơn hàng thành công", null));
    }
}