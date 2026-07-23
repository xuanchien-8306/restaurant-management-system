package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.ProfileDtos.*;
import com.rms.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", profileService.getCurrentUserProfile()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thông tin thành công", profileService.updateProfile(request)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đổi mật khẩu thành công. Vui lòng đăng nhập lại!", null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        profileService.logout();
        return ResponseEntity.ok(new ApiResponse<>(true, "Đăng xuất thành công", null));
    }
}
