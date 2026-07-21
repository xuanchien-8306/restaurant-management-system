package com.rms.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {
    private String fullName;
    private String phone;

    @NotNull(message = "Ngày đặt bàn không được để trống")
    @Future(message = "Ngày đặt bàn phải ở tương lai")
    private LocalDate date;

    @NotNull(message = "Giờ đặt bàn không được để trống")
    private LocalTime time;

    @Min(value = 1, message = "Số lượng khách phải lớn hơn 0")
    private int guestCount;

    private String note;
}