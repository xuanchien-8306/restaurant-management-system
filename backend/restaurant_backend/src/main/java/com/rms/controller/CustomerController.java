package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.ChangePasswordRequest;
import com.rms.dto.CustomerProfileDto;
import com.rms.dto.UpdateProfileRequest;
import com.rms.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> getProfile(Authentication authentication) {
        String username = authentication.getName();
        CustomerProfileDto profile = customerService.getCurrentCustomerProfile(username);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin thành công", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerProfileDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request, Authentication authentication) {
        String username = authentication.getName();
        CustomerProfileDto profile = customerService.updateProfile(username, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật hồ sơ thành công", profile));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        String username = authentication.getName();
        customerService.changePassword(username, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đổi mật khẩu thành công", null));
    }
}