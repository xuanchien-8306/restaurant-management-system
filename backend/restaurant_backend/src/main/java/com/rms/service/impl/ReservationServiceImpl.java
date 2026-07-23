package com.rms.service.impl;

import com.rms.dto.PageResponse;
import com.rms.dto.ReservationDtos.*;
import com.rms.model.Reservation;
import com.rms.model.RestaurantOrder;
import com.rms.model.RestaurantTable;
import com.rms.repository.CustomerRepository;
import com.rms.repository.ReservationRepository;
import com.rms.repository.RestaurantOrderRepository;
import com.rms.repository.RestaurantTableRepository;
import com.rms.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantOrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> getReservations(String keyword, String status, Long tableId, LocalDate date, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String searchKey = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : "";
        String filterStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : "";
        Long filterTable = (tableId != null) ? tableId : -1L;

        Page<Reservation> resPage = reservationRepository.searchAndFilter(searchKey, filterStatus, filterTable, date, pageable);

        return PageResponse.<ReservationResponse>builder()
                .content(resPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(resPage.getNumber())
                .pageSize(resPage.getSize())
                .totalElements(resPage.getTotalElements())
                .totalPages(resPage.getTotalPages())
                .last(resPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        return mapToDto(reservationRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đặt bàn")));
    }

    @Override
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        validateTableAvailability(request.getTableId(), request.getReservationDate(), request.getReservationTime(), null);

        Reservation reservation = new Reservation();
        reservation.setReservationCode("RES-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        mapRequestToEntity(request, reservation);

        return mapToDto(reservationRepository.save(reservation));
    }

    @Override
    @Transactional
    public ReservationResponse updateReservation(Long id, ReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đặt bàn"));

        if (!Arrays.asList("PENDING", "CONFIRMED").contains(reservation.getStatus())) {
            throw new RuntimeException("Chỉ có thể cập nhật đơn đặt bàn đang chờ hoặc đã xác nhận");
        }

        validateTableAvailability(request.getTableId(), request.getReservationDate(), request.getReservationTime(), id);
        mapRequestToEntity(request, reservation);

        return mapToDto(reservationRepository.save(reservation));
    }

    @Override
    @Transactional
    public void changeStatus(Long id, String status) {
        Reservation reservation = reservationRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đặt bàn"));
        reservation.setStatus(status);
        reservationRepository.save(reservation);
    }

    @Override
    @Transactional
    public void checkIn(Long id, String staffName) {
        Reservation reservation = reservationRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy đặt bàn"));

        if (!Arrays.asList("PENDING", "CONFIRMED").contains(reservation.getStatus())) {
            throw new RuntimeException("Không thể check-in cho trạng thái này");
        }

        RestaurantTable table = reservation.getRestaurantTable();

        // 1. Cập nhật trạng thái Đặt bàn
        reservation.setStatus("CHECKED_IN");
        reservationRepository.save(reservation);

        // 2. Cập nhật trạng thái Bàn
        table.setStatus("IN_USE");
        tableRepository.save(table);

        // 3. Tự động khởi tạo một Hóa đơn POS cho bàn này
        RestaurantOrder newOrder = new RestaurantOrder();
        newOrder.setOrderCode("POS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        newOrder.setRestaurantTable(table);
        newOrder.setCustomer(reservation.getCustomer());
        newOrder.setStaffName(staffName);
        newOrder.setOrderType("DINE_IN");
        newOrder.setStatus("PENDING");
        newOrder.setNote("Đơn từ đặt bàn: " + reservation.getReservationCode());

        orderRepository.save(newOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTable> getAvailableTables(LocalDate date, LocalTime time, Integer guestCount, Long currentReservationId) {
        List<RestaurantTable> allTables = tableRepository.findByStatusNot("DELETED");

        // Lấy tất cả đặt bàn trong ngày có trạng thái Giữ chỗ
        List<Reservation> dailyReservations = reservationRepository.findByReservationDateAndStatusIn(
                date, Arrays.asList("PENDING", "CONFIRMED"));

        return allTables.stream().filter(table -> {
            // Lọc sức chứa
            if (guestCount != null && table.getCapacity() < guestCount) return false;

            // Kiểm tra trùng giờ (Giả định mỗi ca ăn kéo dài 2 tiếng)
            boolean isOverlapping = dailyReservations.stream()
                    .filter(r -> r.getRestaurantTable().getId().equals(table.getId()))
                    .filter(r -> currentReservationId == null || !r.getId().equals(currentReservationId)) // Bỏ qua chính nó khi Edit
                    .anyMatch(r -> {
                        LocalTime existingTime = r.getReservationTime();
                        // Nếu thời gian đặt mới nằm trong khoảng [existing - 2h, existing + 2h] -> Trùng
                        return !time.isBefore(existingTime.minusHours(2)) && !time.isAfter(existingTime.plusHours(2));
                    });

            return !isOverlapping;
        }).collect(Collectors.toList());
    }

    private void validateTableAvailability(Long tableId, LocalDate date, LocalTime time, Long currentResId) {
        List<RestaurantTable> availableTables = getAvailableTables(date, time, null, currentResId);
        boolean isAvailable = availableTables.stream().anyMatch(t -> t.getId().equals(tableId));
        if (!isAvailable) {
            throw new RuntimeException("Bàn này đã được đặt trong khoảng thời gian 2 tiếng quanh giờ bạn chọn!");
        }
    }

    private void mapRequestToEntity(ReservationRequest request, Reservation reservation) {
        if (request.getCustomerId() != null) {
            reservation.setCustomer(customerRepository.findById(request.getCustomerId()).orElse(null));
        } else {
            reservation.setCustomer(null);
        }

        reservation.setCustomerName(request.getCustomerName());
        reservation.setCustomerPhone(request.getCustomerPhone());
        reservation.setRestaurantTable(tableRepository.findById(request.getTableId()).orElseThrow(() -> new RuntimeException("Không tìm thấy bàn")));
        reservation.setGuestCount(request.getGuestCount());
        reservation.setReservationDate(request.getReservationDate());
        reservation.setReservationTime(request.getReservationTime());
        reservation.setNote(request.getNote());

        if (request.getStatus() != null) {
            reservation.setStatus(request.getStatus());
        }
    }

    private ReservationResponse mapToDto(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .reservationCode(r.getReservationCode())
                .customerId(r.getCustomer() != null ? r.getCustomer().getId() : null)
                .customerName(r.getCustomerName())
                .customerPhone(r.getCustomerPhone())
                .tableId(r.getRestaurantTable().getId())
                .tableName(r.getRestaurantTable().getName())
                .areaName(r.getRestaurantTable().getArea() != null ? r.getRestaurantTable().getArea().getName() : "")
                .guestCount(r.getGuestCount())
                .reservationDate(r.getReservationDate())
                .reservationTime(r.getReservationTime())
                .note(r.getNote())
                .status(r.getStatus())
                .build();
    }
}