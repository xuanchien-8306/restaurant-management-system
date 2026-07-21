package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.BookingDto;
import com.rms.dto.BookingRequest;
import com.rms.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(@Valid @RequestBody BookingRequest request, Authentication authentication) {
        BookingDto booking = bookingService.createBooking(request, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Đặt bàn thành công! Chúng tôi sẽ liên hệ để xác nhận.", booking));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getMyBookings(Authentication authentication) {
        List<BookingDto> bookings = bookingService.getMyBookings(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", bookings));
    }
}