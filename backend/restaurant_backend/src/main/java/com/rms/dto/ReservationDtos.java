package com.rms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

public class ReservationDtos {

    @Data
    @Builder
    public static class ReservationResponse {
        private Long id;
        private String reservationCode;
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private Long tableId;
        private String tableName;
        private String areaName;
        private Integer guestCount;
        private LocalDate reservationDate;
        private LocalTime reservationTime;
        private String note;
        private String status;
    }

    @Data
    public static class ReservationRequest {
        private Long customerId;

        @NotBlank(message = "Tên khách hàng không được để trống")
        private String customerName;

        @NotBlank(message = "Số điện thoại không được để trống")
        private String customerPhone;

        @NotNull(message = "Vui lòng chọn bàn")
        private Long tableId;

        @NotNull(message = "Vui lòng nhập số lượng khách")
        @Min(value = 1, message = "Số lượng khách tối thiểu là 1")
        private Integer guestCount;

        @NotNull(message = "Vui lòng chọn ngày đặt")
        private LocalDate reservationDate;

        @NotNull(message = "Vui lòng chọn giờ đặt")
        private LocalTime reservationTime;

        private String note;
        private String status;
    }
}