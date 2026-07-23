package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.OrderDtos.OrderResponse;
import com.rms.service.KdsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/kds")
@RequiredArgsConstructor
public class KdsController {

    private final KdsService kdsService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveOrders() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", kdsService.getActiveKitchenOrders()));
    }

    @PatchMapping("/orders/{orderId}/items/{itemId}/status")
    public ResponseEntity<ApiResponse<String>> updateItemStatus(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @RequestParam String status) {
        kdsService.updateItemStatus(orderId, itemId, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã cập nhật trạng thái món", null));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<String>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        kdsService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã cập nhật trạng thái đơn", null));
    }
}