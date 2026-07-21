package com.rms.service.impl;

import com.rms.dto.ChangePasswordRequest;
import com.rms.dto.CustomerProfileDto;
import com.rms.dto.UpdateProfileRequest;
import com.rms.model.Account;
import com.rms.model.Customer;
import com.rms.repository.AccountRepository;
import com.rms.repository.CustomerRepository;
import com.rms.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public CustomerProfileDto getCurrentCustomerProfile(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        return mapToDto(account);
    }

    @Override
    @Transactional
    public CustomerProfileDto updateProfile(String username, UpdateProfileRequest request) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        // Validate Email unique
        Optional<Account> existEmail = accountRepository.findByEmail(request.getEmail());
        if (existEmail.isPresent() && !existEmail.get().getId().equals(account.getId())) {
            throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác");
        }

        // Validate Phone unique
        Optional<Account> existPhone = accountRepository.findByPhone(request.getPhone());
        if (existPhone.isPresent() && !existPhone.get().getId().equals(account.getId())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng bởi tài khoản khác");
        }

        // Validate DOB
        if (request.getDob() != null) {
            if (request.getDob().isAfter(LocalDate.now())) {
                throw new RuntimeException("Ngày sinh không được lớn hơn ngày hiện tại");
            }
            int age = Period.between(request.getDob(), LocalDate.now()).getYears();
            if (age < 12) {
                throw new RuntimeException("Tuổi phải từ 12 trở lên");
            }
        }

        // Update Account
        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        accountRepository.save(account);

        // Update Customer
        Customer customer = account.getCustomer();
        customer.setFullName(request.getFullName());
        customer.setGender(request.getGender());
        customer.setDob(request.getDob());
        customer.setAddress(request.getAddress());
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            customer.setAvatar(request.getAvatar());
        }
        customerRepository.save(customer);

        return mapToDto(account);
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    private CustomerProfileDto mapToDto(Account account) {
        Customer customer = account.getCustomer();
        return CustomerProfileDto.builder()
                .id(customer != null ? customer.getId() : null)
                .username(account.getUsername())
                .fullName(customer != null ? customer.getFullName() : account.getUsername())
                .email(account.getEmail())
                .phone(account.getPhone())
                .avatar(customer != null ? customer.getAvatar() : null)
                .role(account.getRole().getName())
                .gender(customer != null ? customer.getGender() : null)
                .dob(customer != null ? customer.getDob() : null)
                .address(customer != null ? customer.getAddress() : null)
                .createdAt(account.getCreatedAt())
                .build();
    }
}