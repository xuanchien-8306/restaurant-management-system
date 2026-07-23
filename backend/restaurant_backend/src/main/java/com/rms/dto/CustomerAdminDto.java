package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerAdminDto {
    private Long id;
    private Long accountId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dob;
    private String address;
    private String status;
    private LocalDateTime createdAt;
}