package com.rms.config;

import com.rms.model.Account;
import com.rms.model.Role;
import com.rms.repository.AccountRepository;
import com.rms.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setName("ADMIN");
            return roleRepository.save(role);
        });

        roleRepository.findByName("CUSTOMER").orElseGet(() -> {
            Role role = new Role();
            role.setName("CUSTOMER");
            return roleRepository.save(role);
        });

        roleRepository.findByName("STAFF").orElseGet(() -> {
            Role role = new Role();
            role.setName("STAFF");
            return roleRepository.save(role);
        });

        if (!accountRepository.existsByUsername("admin")) {
            Account admin = Account.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("123456"))
                    .email("admin@rms.com")
                    .phone("0000000000")
                    .role(adminRole)
                    .build();
            accountRepository.save(admin);
        }
    }
}