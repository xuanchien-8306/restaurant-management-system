package com.rms.service.impl;

import com.rms.dto.ProfileDtos.*;
import com.rms.model.Account;
import com.rms.repository.AccountRepository;
import com.rms.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Account getCurrentAccount() {
        String username = getCurrentUsername();
        return accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng"));
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getCurrentUserProfile() {
        Account account = getCurrentAccount();
        return mapToResponse(account);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        Account account = getCurrentAccount();

        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        account.setAddress(request.getAddress());
        account.setGender(request.getGender());
        account.setDob(request.getDob());
        if (request.getAvatar() != null) {
            account.setAvatar(request.getAvatar());
        }

        Account updatedAccount = accountRepository.save(account);
        return mapToResponse(updatedAccount);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Xác nhận mật khẩu không khớp!");
        }

        Account account = getCurrentAccount();

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
        }

        if (passwordEncoder.matches(request.getNewPassword(), account.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu cũ!");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    @Override
    public void logout() {
        SecurityContextHolder.clearContext();
    }

    private ProfileResponse mapToResponse(Account account) {
        return ProfileResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                // FIX: Lấy tên Role từ Entity Role của dự án cũ
                .role(account.getRole() != null ? account.getRole().getName() : null)
                .fullName(account.getFullName())
                .email(account.getEmail())
                .phone(account.getPhone())
                .address(account.getAddress())
                .gender(account.getGender())
                .dob(account.getDob())
                .avatar(account.getAvatar())
                .createdAt(account.getCreatedAt() != null ? account.getCreatedAt().toString() : null)
                .build();
    }
}