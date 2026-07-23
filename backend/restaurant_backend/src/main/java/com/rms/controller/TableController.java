package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.PageResponse;
import com.rms.dto.TableDtos.*;
import com.rms.model.TableArea;
import com.rms.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TableResponse>>> getTables(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long areaId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công",
                tableService.getTables(keyword, areaId, status, page, size, sortBy, sortDir)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", tableService.getAllActiveTables()));
    }

    @GetMapping("/areas")
    public ResponseEntity<ApiResponse<List<TableArea>>> getAreas() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", tableService.getActiveAreas()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody TableRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm bàn thành công", tableService.createTable(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(@PathVariable Long id, @Valid @RequestBody TableRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật bàn thành công", tableService.updateTable(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa bàn thành công", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> changeStatus(@PathVariable Long id, @RequestParam String status) {
        tableService.changeStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đổi trạng thái thành công", null));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<String>> transferTable(@RequestBody TableActionRequest request) {
        tableService.transferTable(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Chuyển bàn thành công", null));
    }

    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<String>> mergeTables(@RequestBody TableActionRequest request) {
        tableService.mergeTables(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Gộp bàn thành công", null));
    }

    @PostMapping("/split")
    public ResponseEntity<ApiResponse<String>> splitTable(@RequestBody TableActionRequest request) {
        tableService.splitTable(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tách bàn thành công", null));
    }
}