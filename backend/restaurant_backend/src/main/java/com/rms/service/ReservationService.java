package com.rms.service;

import com.rms.dto.PageResponse;
import com.rms.dto.ReservationDtos.*;
import com.rms.model.RestaurantTable;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationService {
    PageResponse<ReservationResponse> getReservations(String keyword, String status, Long tableId, LocalDate date, int page, int size, String sortBy, String sortDir);
    ReservationResponse getReservationById(Long id);
    ReservationResponse createReservation(ReservationRequest request);
    ReservationResponse updateReservation(Long id, ReservationRequest request);
    void changeStatus(Long id, String status);
    void checkIn(Long id, String staffName);

    // Tìm các bàn còn trống theo ngày, giờ và số lượng khách (Giữ chỗ 2 tiếng mỗi ca)
    List<RestaurantTable> getAvailableTables(LocalDate date, LocalTime time, Integer guestCount, Long currentReservationId);
}