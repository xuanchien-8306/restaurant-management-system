package com.rms.service;

import com.rms.dto.BookingDto;
import com.rms.dto.BookingRequest;
import java.util.List;

public interface BookingService {
    BookingDto createBooking(BookingRequest request, String username);
    List<BookingDto> getMyBookings(String username);
}