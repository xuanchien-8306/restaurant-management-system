package com.rms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

public class ProfileDtos {

    @Data
    @Builder
    public static class ProfileResponse {
        private Long id;
        private String username;
        private String role;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private String gender; // MALE, FEMALE, OTHER
        private LocalDate dob;
        private String avatar;
        private String createdAt;
    }

    @Data
    public static class UpdateProfileRequest {
        @NotBlank(message = "Họ tên không được để trống")
        private String fullName;

        @Email(message = "Email không đúng định dạng")
        private String email;

        @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không hợp lệ")
        private String phone;

        private String address;
        private String gender;
        private LocalDate dob;
        private String avatar; // Chấp nhận URL hoặc chuỗi Base64
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank(message = "Mật khẩu hiện tại không được để trống")
        private String oldPassword;

        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$",
                message = "Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ cái và 1 chữ số")
        private String newPassword;

        @NotBlank(message = "Xác nhận mật khẩu không được để trống")
        private String confirmPassword;
    }
}