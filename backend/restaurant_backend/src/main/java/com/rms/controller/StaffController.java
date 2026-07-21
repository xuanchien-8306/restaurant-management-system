package com.rms.controller;

import com.rms.dto.ApiResponse;
import com.rms.dto.PageResponse;
import com.rms.dto.StaffDto;
import com.rms.dto.StaffRequest;
import com.rms.model.Role;
import com.rms.repository.RoleRepository;
import com.rms.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/staffs")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;
    private final RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StaffDto>>> getStaffs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<StaffDto> result = staffService.getStaffs(keyword, roleId, status, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", result));
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<Role>>> getStaffRoles() {
        // Chỉ lấy các quyền của nhân viên nội bộ (Loại bỏ CUSTOMER nếu cần)
        List<Role> roles = roleRepository.findAll().stream()
                .filter(r -> !r.getName().equals("CUSTOMER"))
                .toList();
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", roles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffDto>> getStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thành công", staffService.getStaffById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StaffDto>> createStaff(@Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm nhân viên thành công", staffService.createStaff(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffDto>> updateStaff(@PathVariable Long id, @Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật nhân viên thành công", staffService.updateStaff(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> toggleStaffStatus(@PathVariable Long id) {
        staffService.toggleStaffStatus(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thay đổi trạng thái nhân viên thành công", null));
    }
}