package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StaffDto {
    private Long id;
    private Long accountId;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private Long roleId;
    private String roleName;
    private String status;
    private LocalDateTime createdAt;
}