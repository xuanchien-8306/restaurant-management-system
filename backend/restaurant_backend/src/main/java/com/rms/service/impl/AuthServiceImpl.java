package com.rms.service.impl;

import com.rms.dto.AuthResponse;
import com.rms.dto.LoginRequest;
import com.rms.dto.RegisterRequest;
import com.rms.model.Account;
import com.rms.model.Customer;
import com.rms.model.Role;
import com.rms.repository.AccountRepository;
import com.rms.repository.CustomerRepository;
import com.rms.repository.RoleRepository;
import com.rms.security.JwtService;
import com.rms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Lỗi hệ thống: Không tìm thấy Role CUSTOMER"));

        // Generate dummy data để pass Database Constraint (NOT NULL & UNIQUE)
        String dummyEmail = request.getUsername() + "@rms.local";
        String dummyPhone = String.valueOf(System.currentTimeMillis()).substring(3);

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(dummyEmail)
                .phone(dummyPhone)
                .role(customerRole)
                .build();

        account = accountRepository.save(account);

        Customer customer = Customer.builder()
                .account(account)
                .fullName(request.getUsername())
                .build();

        customerRepository.save(customer);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        String token = jwtService.generateToken(account.getUsername(), account.getRole().getName());

        return AuthResponse.builder()
                .token(token)
                .username(account.getUsername())
                .role(account.getRole().getName())
                .build();
    }
}