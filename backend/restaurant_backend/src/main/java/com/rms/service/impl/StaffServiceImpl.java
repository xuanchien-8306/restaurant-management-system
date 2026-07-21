package com.rms.service.impl;

import com.rms.dto.PageResponse;
import com.rms.dto.StaffDto;
import com.rms.dto.StaffRequest;
import com.rms.model.Account;
import com.rms.model.Role;
import com.rms.model.Staff;
import com.rms.repository.AccountRepository;
import com.rms.repository.RoleRepository;
import com.rms.repository.StaffRepository;
import com.rms.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResponse<StaffDto> getStaffs(String keyword, Long roleId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<Staff> staffPage = staffRepository.searchAndFilterStaff(searchKeyword, roleId, status, pageable);

        return PageResponse.<StaffDto>builder()
                .content(staffPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(staffPage.getNumber())
                .pageSize(staffPage.getSize())
                .totalElements(staffPage.getTotalElements())
                .totalPages(staffPage.getTotalPages())
                .last(staffPage.isLast())
                .build();
    }

    @Override
    public StaffDto getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        return mapToDto(staff);
    }

    @Override
    @Transactional
    public StaffDto createStaff(StaffRequest request) {
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        if (accountRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Vai trò không hợp lệ"));

        String rawPassword = (request.getPassword() != null && !request.getPassword().isEmpty())
                ? request.getPassword() : "Rms@123456"; // Mật khẩu mặc định

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(rawPassword))
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(role)
                .build();
        account = accountRepository.save(account);

        Staff staff = Staff.builder()
                .account(account)
                .fullName(request.getFullName())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();
        staff = staffRepository.save(staff);

        return mapToDto(staff);
    }

    @Override
    @Transactional
    public StaffDto updateStaff(Long id, StaffRequest request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        Account account = staff.getAccount();

        Optional<Account> existEmail = accountRepository.findByEmail(request.getEmail());
        if (existEmail.isPresent() && !existEmail.get().getId().equals(account.getId())) {
            throw new RuntimeException("Email đã được sử dụng bởi người khác");
        }

        Optional<Account> existPhone = accountRepository.findByPhone(request.getPhone());
        if (existPhone.isPresent() && !existPhone.get().getId().equals(account.getId())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng bởi người khác");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Vai trò không hợp lệ"));

        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        account.setRole(role);

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        accountRepository.save(account);

        staff.setFullName(request.getFullName());
        if (request.getStatus() != null) {
            staff.setStatus(request.getStatus());
        }
        staff = staffRepository.save(staff);

        return mapToDto(staff);
    }

    @Override
    @Transactional
    public void toggleStaffStatus(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        if ("DISABLED".equals(staff.getStatus())) {
            staff.setStatus("ACTIVE");
        } else {
            staff.setStatus("DISABLED");
        }
        staffRepository.save(staff);
    }

    private StaffDto mapToDto(Staff staff) {
        return StaffDto.builder()
                .id(staff.getId())
                .accountId(staff.getAccount().getId())
                .username(staff.getAccount().getUsername())
                .fullName(staff.getFullName())
                .email(staff.getAccount().getEmail())
                .phone(staff.getAccount().getPhone())
                .roleId(staff.getAccount().getRole().getId())
                .roleName(staff.getAccount().getRole().getName())
                .status(staff.getStatus())
                .createdAt(staff.getCreatedAt())
                .build();
    }
}