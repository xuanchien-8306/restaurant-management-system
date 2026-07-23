package com.rms.service.impl;

import com.rms.dto.CustomerAdminDto;
import com.rms.dto.CustomerAdminRequest;
import com.rms.dto.PageResponse;
import com.rms.model.Account;
import com.rms.model.Customer;
import com.rms.model.Role;
import com.rms.repository.AccountRepository;
import com.rms.repository.CustomerRepository;
import com.rms.repository.RoleRepository;
import com.rms.service.CustomerAdminService;
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
public class CustomerAdminServiceImpl implements CustomerAdminService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResponse<CustomerAdminDto> getCustomers(String keyword, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<Customer> customerPage = customerRepository.searchAndFilterCustomer(searchKeyword, status, pageable);

        return PageResponse.<CustomerAdminDto>builder()
                .content(customerPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .pageNumber(customerPage.getNumber())
                .pageSize(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .last(customerPage.isLast())
                .build();
    }

    @Override
    public CustomerAdminDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        return mapToDto(customer);
    }

    @Override
    @Transactional
    public CustomerAdminDto createCustomer(CustomerAdminRequest request) {
        if (accountRepository.existsByUsername(request.getUsername())) throw new RuntimeException("Tên đăng nhập đã tồn tại");
        if (accountRepository.existsByEmail(request.getEmail())) throw new RuntimeException("Email đã được sử dụng");
        if (accountRepository.existsByPhone(request.getPhone())) throw new RuntimeException("Số điện thoại đã được sử dụng");

        Role role = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Role CUSTOMER"));

        String rawPassword = (request.getPassword() != null && !request.getPassword().isEmpty())
                ? request.getPassword() : "Customer@123";

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(rawPassword))
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(role)
                .build();
        account = accountRepository.save(account);

        Customer customer = Customer.builder()
                .account(account)
                .fullName(request.getFullName())
                .gender(request.getGender())
                .dob(request.getDob())
                .address(request.getAddress())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();
        customer = customerRepository.save(customer);

        return mapToDto(customer);
    }

    @Override
    @Transactional
    public CustomerAdminDto updateCustomer(Long id, CustomerAdminRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        Account account = customer.getAccount();

        Optional<Account> existEmail = accountRepository.findByEmail(request.getEmail());
        if (existEmail.isPresent() && !existEmail.get().getId().equals(account.getId())) {
            throw new RuntimeException("Email đã được sử dụng bởi người khác");
        }

        Optional<Account> existPhone = accountRepository.findByPhone(request.getPhone());
        if (existPhone.isPresent() && !existPhone.get().getId().equals(account.getId())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng bởi người khác");
        }

        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        accountRepository.save(account);

        customer.setFullName(request.getFullName());
        customer.setGender(request.getGender());
        customer.setDob(request.getDob());
        customer.setAddress(request.getAddress());
        if (request.getStatus() != null) customer.setStatus(request.getStatus());

        customer = customerRepository.save(customer);
        return mapToDto(customer);
    }

    @Override
    @Transactional
    public void toggleCustomerStatus(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        customer.setStatus("DISABLED".equals(customer.getStatus()) ? "ACTIVE" : "DISABLED");
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void softDeleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        customer.setStatus("DELETED");
        customerRepository.save(customer);
    }

    private CustomerAdminDto mapToDto(Customer customer) {
        return CustomerAdminDto.builder()
                .id(customer.getId())
                .accountId(customer.getAccount().getId())
                .username(customer.getAccount().getUsername())
                .fullName(customer.getFullName())
                .email(customer.getAccount().getEmail())
                .phone(customer.getAccount().getPhone())
                .gender(customer.getGender())
                .dob(customer.getDob())
                .address(customer.getAddress())
                .status(customer.getStatus())
                .createdAt(customer.getAccount().getCreatedAt())
                .build();
    }
}