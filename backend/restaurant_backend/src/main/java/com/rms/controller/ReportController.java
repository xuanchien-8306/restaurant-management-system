package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.ReportDtos.*;
import com.rms.service.ReportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // Chuyển đổi String an toàn để tránh lỗi 400 Bad Request
    private LocalDateTime parseTime(String timeStr) {
        return LocalDateTime.parse(timeStr);
    }

    @GetMapping("/kpi")
    public ResponseEntity<ApiResponse<KpiResponse>> getKpi(@RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", reportService.getKpiSummary(parseTime(start), parseTime(end))));
    }

    @GetMapping("/charts/revenue")
    public ResponseEntity<ApiResponse<List<ChartDataResponse>>> getRevenueChart(
            @RequestParam String start, @RequestParam String end, @RequestParam(defaultValue = "DAILY") String groupBy) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", reportService.getRevenueTimeline(parseTime(start), parseTime(end), groupBy)));
    }

    @GetMapping("/charts/payment-methods")
    public ResponseEntity<ApiResponse<List<ChartDataResponse>>> getPaymentMethods(@RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", reportService.getRevenueByPaymentMethod(parseTime(start), parseTime(end))));
    }

    @GetMapping("/charts/order-status")
    public ResponseEntity<ApiResponse<List<ChartDataResponse>>> getOrderStatus(@RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", reportService.getOrdersByStatus(parseTime(start), parseTime(end))));
    }

    @GetMapping("/tables/top-items")
    public ResponseEntity<ApiResponse<List<TopItemResponse>>> getTopItems(
            @RequestParam String start, @RequestParam String end, @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", reportService.getTopSellingItems(parseTime(start), parseTime(end), limit)));
    }

    @GetMapping("/tables/inventory-warning")
    public ResponseEntity<ApiResponse<List<InventoryReportResponse>>> getInventoryWarning() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", reportService.getInventoryWarning()));
    }

    @GetMapping("/export/excel")
    public void exportExcel(@RequestParam String start, @RequestParam String end, HttpServletResponse response) throws Exception {
        reportService.exportRevenueExcel(parseTime(start), parseTime(end), response);
    }

    @GetMapping("/export/pdf")
    public void exportPdf(@RequestParam String start, @RequestParam String end, HttpServletResponse response) throws Exception {
        reportService.exportRevenuePdf(parseTime(start), parseTime(end), response);
    }
}