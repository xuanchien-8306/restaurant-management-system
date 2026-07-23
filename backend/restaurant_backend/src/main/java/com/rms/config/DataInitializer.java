package com.rms.config;

import com.rms.model.Account;
import com.rms.model.Role;
import com.rms.model.Staff;
import com.rms.repository.AccountRepository;
import com.rms.repository.RoleRepository;
import com.rms.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Init Roles
        Arrays.asList("ADMIN", "MANAGER", "CASHIER", "WAITER", "KITCHEN", "CUSTOMER").forEach(roleName -> {
            roleRepository.findByName(roleName).orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                return roleRepository.save(role);
            });
        });

        Role adminRole = roleRepository.findByName("ADMIN").get();

        // Seed Admin Account
        if (!accountRepository.existsByUsername("admin")) {
            Account adminAccount = Account.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("123456"))
                    .email("admin@restaurant.com")
                    .phone("0000000000") // Dummy phone to pass validation
                    .role(adminRole)
                    .build();
            adminAccount = accountRepository.save(adminAccount);

            Staff adminStaff = Staff.builder()
                    .account(adminAccount)
                    .fullName("System Administrator")
                    .status("ACTIVE")
                    .build();
            staffRepository.save(adminStaff);
        }
    }
}