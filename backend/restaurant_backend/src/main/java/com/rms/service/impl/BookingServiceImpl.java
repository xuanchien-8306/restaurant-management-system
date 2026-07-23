package com.rms.service.impl;

import com.rms.dto.BookingDto;
import com.rms.dto.BookingRequest;
import com.rms.model.Account;
import com.rms.model.Customer;
import com.rms.model.Reservation;
import com.rms.repository.AccountRepository;
import com.rms.repository.ReservationRepository;
import com.rms.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final ReservationRepository reservationRepository;
    private final AccountRepository accountRepository;

    @Override
    public BookingDto createBooking(BookingRequest request, String username) {

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Customer customer = account.getCustomer();

        LocalDateTime resTime =
                LocalDateTime.of(request.getDate(), request.getTime());

        String customerName =
                (account.getFullName() != null && !account.getFullName().trim().isEmpty())
                        ? account.getFullName()
                        : account.getUsername();

        String customerPhone =
                (account.getPhone() != null && !account.getPhone().trim().isEmpty())
                        ? account.getPhone()
                        : request.getPhone();

        Reservation reservation = Reservation.builder()
                .customer(customer)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .reservationCode("RES-" + System.currentTimeMillis())
                .reservationDate(resTime.toLocalDate())
                .reservationTime(resTime.toLocalTime())
                .guestCount(request.getGuestCount())
                .note(request.getNote())
                .status("PENDING")
                .build();

        reservation = reservationRepository.save(reservation);

        return mapToDto(reservation);
    }

    @Override
    public List<BookingDto> getMyBookings(String username) {

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        return reservationRepository
                .findByCustomerIdOrderByReservationDateDescReservationTimeDesc(
                        account.getCustomer().getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private BookingDto mapToDto(Reservation reservation) {

        return BookingDto.builder()
                .id(reservation.getId())
                .customerName(reservation.getCustomerName())
                .phone(reservation.getCustomerPhone())
                .reservationTime(
                        LocalDateTime.of(
                                reservation.getReservationDate(),
                                reservation.getReservationTime()))
                .guestCount(reservation.getGuestCount())
                .note(reservation.getNote())
                .status(reservation.getStatus())
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}