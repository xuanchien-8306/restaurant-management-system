package com.rms.service;

import com.rms.dto.ReportDtos.*;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {
    KpiResponse getKpiSummary(LocalDateTime startDate, LocalDateTime endDate);
    List<ChartDataResponse> getRevenueTimeline(LocalDateTime startDate, LocalDateTime endDate, String groupBy);
    List<ChartDataResponse> getRevenueByPaymentMethod(LocalDateTime startDate, LocalDateTime endDate);
    List<ChartDataResponse> getOrdersByStatus(LocalDateTime startDate, LocalDateTime endDate);
    List<TopItemResponse> getTopSellingItems(LocalDateTime startDate, LocalDateTime endDate, int limit);
    List<InventoryReportResponse> getInventoryWarning();

    void exportRevenueExcel(LocalDateTime startDate, LocalDateTime endDate, HttpServletResponse response) throws Exception;
    void exportRevenuePdf(LocalDateTime startDate, LocalDateTime endDate, HttpServletResponse response) throws Exception;
}