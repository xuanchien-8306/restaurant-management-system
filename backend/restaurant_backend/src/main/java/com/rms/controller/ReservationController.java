package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.PageResponse;
import com.rms.dto.ReservationDtos.*;
import com.rms.model.RestaurantTable;
import com.rms.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReservationResponse>>> getReservations(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long tableId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "reservationDate") String sortBy   ,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công",
                reservationService.getReservations(keyword, status, tableId, date, page, size, sortBy, sortDir)));
    }

    @GetMapping("/available-tables")
    public ResponseEntity<ApiResponse<List<RestaurantTable>>> getAvailableTables(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam(required = false) Integer guestCount,
            @RequestParam(required = false) Long currentId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công",
                reservationService.getAvailableTables(date, time, guestCount, currentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Đặt bàn thành công", reservationService.createReservation(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateReservation(@PathVariable Long id, @Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật đặt bàn thành công", reservationService.updateReservation(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> changeStatus(@PathVariable Long id, @RequestParam String status) {
        reservationService.changeStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái thành công", null));
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<String>> checkIn(@PathVariable Long id) {
        reservationService.checkIn(id, "Admin"); // Chuyển từ Đặt bàn sang POS
        return ResponseEntity.ok(new ApiResponse<>(true, "Check-in thành công. Đã tạo Hóa đơn POS.", null));
    }
}