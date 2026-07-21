package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingDto {
    private Long id;
    private String customerName;
    private String phone;
    private LocalDateTime reservationTime;
    private int guestCount;
    private String note;
    private String status;
    private LocalDateTime createdAt;
}