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
        LocalDateTime resTime = LocalDateTime.of(request.getDate(), request.getTime());

        Reservation reservation = Reservation.builder()
                .customer(customer)
                .reservationTime(resTime)
                .guestCount(request.getGuestCount())
                .note(request.getNote())
                .status("PENDING")
                .build();

        reservation = reservationRepository.save(reservation);

        return mapToDto(reservation, account);
    }

    @Override
    public List<BookingDto> getMyBookings(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        return reservationRepository.findByCustomerIdOrderByReservationTimeDesc(account.getCustomer().getId())
                .stream()
                .map(res -> mapToDto(res, account))
                .collect(Collectors.toList());
    }

    private BookingDto mapToDto(Reservation reservation, Account account) {
        return BookingDto.builder()
                .id(reservation.getId())
                .customerName(reservation.getCustomer().getFullName())
                .phone(account.getPhone())
                .reservationTime(reservation.getReservationTime())
                .guestCount(reservation.getGuestCount())
                .note(reservation.getNote())
                .status(reservation.getStatus())
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}