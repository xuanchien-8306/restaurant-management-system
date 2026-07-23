package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.OrderDtos.OrderResponse;
import com.rms.dto.PosDtos.AddItemRequest;
import com.rms.dto.PosDtos.PaymentRequest;
import com.rms.dto.PosDtos.UpdateItemRequest;
import com.rms.service.PosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/pos")
@RequiredArgsConstructor
public class PosController {

    private final PosService posService;

    @GetMapping("/tables/{tableId}/order")
    public ResponseEntity<ApiResponse<OrderResponse>> getActiveOrder(@PathVariable Long tableId) {
        OrderResponse order = posService.getActiveOrderForTable(tableId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", order));
    }

    @PostMapping("/tables/{tableId}/items")
    public ResponseEntity<ApiResponse<OrderResponse>> addItemToOrder(
            @PathVariable Long tableId,
            @Valid @RequestBody AddItemRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm món thành công", posService.addItemToOrder(tableId, request, "Admin POS")));
    }

    @PutMapping("/orders/{orderId}/items/{itemId}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateItemRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật món thành công", posService.updateOrderItem(orderId, itemId, request)));
    }

    @DeleteMapping("/orders/{orderId}/items/{itemId}")
    public ResponseEntity<ApiResponse<OrderResponse>> removeItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa món thành công", posService.removeOrderItem(orderId, itemId)));
    }

    @PostMapping("/orders/{orderId}/kitchen")
    public ResponseEntity<ApiResponse<OrderResponse>> sendToKitchen(@PathVariable Long orderId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã báo bếp", posService.sendToKitchen(orderId)));
    }

    @PostMapping("/orders/{orderId}/pay")
    public ResponseEntity<ApiResponse<OrderResponse>> payOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thanh toán thành công", posService.processPayment(orderId, request)));
    }
}