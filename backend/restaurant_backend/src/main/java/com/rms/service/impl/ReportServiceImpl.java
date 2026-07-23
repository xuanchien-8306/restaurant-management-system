package com.rms.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.rms.dto.ReportDtos.*;
import com.rms.service.ReportService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public KpiResponse getKpiSummary(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal currentRev = BigDecimal.ZERO;
        BigDecimal currentProfit = BigDecimal.ZERO;
        Long currentOrders = 0L;
        Long currentCustomers = 0L;
        Long currentReservations = 0L;
        Double growth = 0.0;

        try {
            // 1. Total Revenue
            String revSql = "SELECT SUM(total_amount) FROM orders WHERE status = 'COMPLETED' AND created_at BETWEEN ?1 AND ?2";
            currentRev = getBigDecimal(entityManager.createNativeQuery(revSql)
                    .setParameter(1, startDate).setParameter(2, endDate).getSingleResult());

            // 2. Cost & Profit
            BigDecimal cost = BigDecimal.ZERO;
            try {
                String costSql = "SELECT SUM(oi.quantity * COALESCE(mi.cost_price, 0)) FROM order_items oi " +
                        "JOIN orders o ON oi.order_id = o.id JOIN menu_items mi ON oi.menu_item_id = mi.id " +
                        "WHERE o.status = 'COMPLETED' AND o.created_at BETWEEN ?1 AND ?2";
                cost = getBigDecimal(entityManager.createNativeQuery(costSql)
                        .setParameter(1, startDate).setParameter(2, endDate).getSingleResult());
            } catch (Exception e) {
                // Bỏ qua nếu thiếu cột cost_price
            }
            currentProfit = currentRev.subtract(cost);

            // 3. Orders
            currentOrders = getLong(entityManager.createNativeQuery("SELECT COUNT(id) FROM orders WHERE created_at BETWEEN ?1 AND ?2")
                    .setParameter(1, startDate).setParameter(2, endDate).getSingleResult());

            // 4. Customers
            currentCustomers = getLong(entityManager.createNativeQuery("SELECT COUNT(id) FROM customers WHERE created_at BETWEEN ?1 AND ?2")
                    .setParameter(1, startDate).setParameter(2, endDate).getSingleResult());

            // 5. Reservations
            currentReservations = getLong(entityManager.createNativeQuery("SELECT COUNT(id) FROM reservations WHERE status != 'DELETED' AND created_at BETWEEN ?1 AND ?2")
                    .setParameter(1, startDate).setParameter(2, endDate).getSingleResult());

            // 6. Growth Rate
            long days = Duration.between(startDate, endDate).toDays();
            LocalDateTime prevStart = startDate.minusDays(days > 0 ? days : 1);
            LocalDateTime prevEnd = startDate;
            BigDecimal prevRev = getBigDecimal(entityManager.createNativeQuery(revSql)
                    .setParameter(1, prevStart).setParameter(2, prevEnd).getSingleResult());

            if (prevRev.compareTo(BigDecimal.ZERO) > 0) {
                growth = currentRev.subtract(prevRev).divide(prevRev, 4, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue();
            } else if (currentRev.compareTo(BigDecimal.ZERO) > 0) {
                growth = 100.0;
            }
        } catch (Exception e) {
            System.err.println("Lỗi tính KPI: " + e.getMessage());
        }

        return KpiResponse.builder()
                .totalRevenue(currentRev)
                .totalProfit(currentProfit)
                .totalOrders(currentOrders)
                .totalCustomers(currentCustomers)
                .totalReservations(currentReservations)
                .revenueGrowthRate(growth)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getRevenueTimeline(LocalDateTime startDate, LocalDateTime endDate, String groupBy) {
        try {
            String dateFormat = "%Y-%m-%d";
            if ("MONTH".equalsIgnoreCase(groupBy)) dateFormat = "%Y-%m";
            if ("YEAR".equalsIgnoreCase(groupBy)) dateFormat = "%Y";

            // Không dùng parameter cho dateFormat để tránh lỗi SQL Dialect, nối chuỗi trực tiếp
            String sql = "SELECT DATE_FORMAT(created_at, '" + dateFormat + "') as label, SUM(total_amount) as val " +
                    "FROM orders WHERE status = 'COMPLETED' AND created_at BETWEEN ?1 AND ?2 " +
                    "GROUP BY label ORDER BY label ASC";

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, startDate);
            query.setParameter(2, endDate);

            return mapToChartData(query.getResultList());
        } catch (Exception e) {
            System.err.println("Lỗi lấy biểu đồ doanh thu: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getRevenueByPaymentMethod(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            String sql = "SELECT COALESCE(payment_method, 'UNKNOWN') as label, SUM(total_amount) as val " +
                    "FROM orders WHERE status = 'COMPLETED' AND created_at BETWEEN ?1 AND ?2 " +
                    "GROUP BY label";
            return mapToChartData(entityManager.createNativeQuery(sql)
                    .setParameter(1, startDate).setParameter(2, endDate).getResultList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getOrdersByStatus(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            String sql = "SELECT status as label, COUNT(id) as val FROM orders WHERE created_at BETWEEN ?1 AND ?2 GROUP BY status";
            return mapToChartData(entityManager.createNativeQuery(sql)
                    .setParameter(1, startDate).setParameter(2, endDate).getResultList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopItemResponse> getTopSellingItems(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        try {
            String sql = "SELECT mi.id, mi.name, c.name as catName, SUM(oi.quantity) as qty, SUM(oi.quantity * oi.unit_price) as rev " +
                    "FROM order_items oi JOIN orders o ON oi.order_id = o.id " +
                    "JOIN menu_items mi ON oi.menu_item_id = mi.id JOIN categories c ON mi.category_id = c.id " +
                    "WHERE o.status = 'COMPLETED' AND o.created_at BETWEEN ?1 AND ?2 " +
                    "GROUP BY mi.id, mi.name, c.name ORDER BY qty DESC LIMIT " + limit;

            List<Object[]> results = entityManager.createNativeQuery(sql)
                    .setParameter(1, startDate)
                    .setParameter(2, endDate)
                    .getResultList();

            List<TopItemResponse> list = new ArrayList<>();
            for (Object[] row : results) {
                list.add(TopItemResponse.builder()
                        .itemId(getLong(row[0]))
                        .itemName((String) row[1])
                        .categoryName((String) row[2])
                        .totalQuantity(getLong(row[3]))
                        .totalRevenue(getBigDecimal(row[4]))
                        .build());
            }
            return list;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryReportResponse> getInventoryWarning() {
        try {
            // Đã sửa 'quantity' thành 'stock_quantity' và 'min_quantity' thành 'min_stock' cho khớp với Entity Ingredient
            String sql = "SELECT id, name, unit, stock_quantity, min_stock FROM ingredients WHERE stock_quantity <= min_stock";
            List<Object[]> results = entityManager.createNativeQuery(sql).getResultList();

            List<InventoryReportResponse> list = new ArrayList<>();
            for (Object[] row : results) {
                list.add(InventoryReportResponse.builder()
                        .ingredientId(getLong(row[0]))
                        .ingredientName((String) row[1])
                        .unit((String) row[2])
                        .currentStock(getDouble(row[3]))
                        .minStockLevel(getDouble(row[4]))
                        .status("LOW_STOCK")
                        .build());
            }
            return list;
        } catch (Exception e) {
            System.err.println("Lỗi truy vấn Kho hàng: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public void exportRevenueExcel(LocalDateTime startDate, LocalDateTime endDate, HttpServletResponse response) throws Exception {
        List<ChartDataResponse> data = getRevenueTimeline(startDate, endDate, "DAILY");

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Doanh Thu");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Ngày");
        headerRow.createCell(1).setCellValue("Doanh Thu (VNĐ)");

        int rowNum = 1;
        for (ChartDataResponse item : data) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(item.getLabel());
            row.createCell(1).setCellValue(item.getValue().doubleValue());
        }

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=DoanhThu.xlsx");
        workbook.write(response.getOutputStream());
        workbook.close();
    }

    @Override
    public void exportRevenuePdf(LocalDateTime startDate, LocalDateTime endDate, HttpServletResponse response) throws Exception {
        List<ChartDataResponse> data = getRevenueTimeline(startDate, endDate, "DAILY");

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=DoanhThu.pdf");

        Document document = new Document();
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font fontTitle = new Font(Font.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("Bao Cao Doanh Thu", fontTitle);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.addCell(new PdfPCell(new Phrase("Ngay")));
        table.addCell(new PdfPCell(new Phrase("Doanh Thu (VND)")));

        for (ChartDataResponse item : data) {
            table.addCell(item.getLabel());
            table.addCell(String.format("%,.0f", item.getValue().doubleValue()));
        }

        document.add(table);
        document.close();
    }

    // --- Utils ---
    private List<ChartDataResponse> mapToChartData(List<Object[]> results) {
        List<ChartDataResponse> list = new ArrayList<>();
        for (Object[] row : results) {
            list.add(ChartDataResponse.builder()
                    .label(String.valueOf(row[0]))
                    .value(getBigDecimal(row[1]))
                    .build());
        }
        return list;
    }

    private BigDecimal getBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        return new BigDecimal(value.toString());
    }

    private Long getLong(Object value) {
        if (value == null) return 0L;
        return Long.valueOf(value.toString());
    }

    private Double getDouble(Object value) {
        if (value == null) return 0.0;
        return Double.valueOf(value.toString());
    }
}