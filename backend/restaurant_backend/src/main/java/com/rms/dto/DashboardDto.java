package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardDto {
    private BigDecimal todayRevenue;
    private long todayOrders;
    private long servingGuests;
    private long totalCustomers;
    private long totalStaff;
}