package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.CustomerAdminDto;
import com.rms.dto.CustomerAdminRequest;
import com.rms.dto.PageResponse;
import com.rms.service.CustomerAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class CustomerAdminController {

    private final CustomerAdminService customerAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CustomerAdminDto>>> getCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        PageResponse<CustomerAdminDto> result = customerAdminService.getCustomers(keyword, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerAdminDto>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", customerAdminService.getCustomerById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerAdminDto>> createCustomer(@Valid @RequestBody CustomerAdminRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm khách hàng thành công", customerAdminService.createCustomer(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerAdminDto>> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerAdminRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật khách hàng thành công", customerAdminService.updateCustomer(id, request)));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<String>> toggleStatus(@PathVariable Long id) {
        customerAdminService.toggleCustomerStatus(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thay đổi trạng thái thành công", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable Long id) {
        customerAdminService.softDeleteCustomer(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa khách hàng thành công", null));
    }
}