package com.rms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {
    private String customerName;
    private String fullName;
    private String phone;

    @NotNull(message = "Ngày đặt bàn không được để trống")
    @FutureOrPresent(message = "Ngày đặt bàn không được ở quá khứ")
    @JsonFormat(pattern = "yyyy-MM-dd") // Thêm dòng này
    private LocalDate date;

    @NotNull(message = "Giờ đặt bàn không được để trống")
    @JsonFormat(pattern = "HH:mm:ss") // Thêm dòng này
    private LocalTime time;

    @Min(value = 1, message = "Số lượng khách phải lớn hơn 0")
    private int guestCount;

    private String note;
}