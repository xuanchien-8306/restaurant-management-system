package com.rms.service;

import com.rms.dto.PageResponse;
import com.rms.dto.StaffDto;
import com.rms.dto.StaffRequest;

public interface StaffService {
    PageResponse<StaffDto> getStaffs(String keyword, Long roleId, String status, int page, int size);
    StaffDto getStaffById(Long id);
    StaffDto createStaff(StaffRequest request);
    StaffDto updateStaff(Long id, StaffRequest request);
    void toggleStaffStatus(Long id);
}