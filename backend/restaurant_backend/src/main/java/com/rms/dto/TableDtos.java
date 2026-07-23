package com.rms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.List;

public class TableDtos {

    @Data
    @Builder
    public static class TableResponse {
        private Long id;
        private String tableCode;
        private String name;
        private Long areaId;
        private String areaName;
        private Integer capacity;
        private String note;
        private String status;
    }

    @Data
    public static class TableRequest {
        @NotBlank(message = "Mã bàn không được để trống")
        private String tableCode;

        @NotBlank(message = "Tên bàn không được để trống")
        private String name;

        @NotNull(message = "Vui lòng chọn khu vực")
        private Long areaId;

        @NotNull(message = "Sức chứa không được để trống")
        @Min(value = 1, message = "Sức chứa phải lớn hơn 0")
        private Integer capacity;

        private String note;
        private String status;
    }

    @Data
    public static class TableActionRequest {
        private Long sourceTableId;
        private Long targetTableId;
        private List<Long> sourceTableIds; // Dùng cho Gộp bàn
    }
}