package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerProfileDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String avatar;
    private String role;
    private String gender;
    private LocalDate dob;
    private String address;
    private LocalDateTime createdAt;
}