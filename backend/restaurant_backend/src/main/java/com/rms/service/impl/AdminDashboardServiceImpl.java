package com.rms.service.impl;

import com.rms.dto.DashboardDto;
import com.rms.repository.CustomerRepository;
import com.rms.repository.OrderRepository;
import com.rms.repository.StaffRepository;
import com.rms.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;

    @Override
    public DashboardDto getDashboardStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        return DashboardDto.builder()
                .todayRevenue(orderRepository.sumTotalAmountByCreatedAtBetween(startOfDay, endOfDay))
                .todayOrders(orderRepository.countByCreatedAtBetween(startOfDay, endOfDay))
                .servingGuests(orderRepository.countServingOrders())
                .totalCustomers(customerRepository.count())
                .totalStaff(staffRepository.count())
                .build();
    }
}