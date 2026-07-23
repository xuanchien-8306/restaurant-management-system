package com.rms.service;

import com.rms.dto.CustomerAdminDto;
import com.rms.dto.CustomerAdminRequest;
import com.rms.dto.PageResponse;

public interface CustomerAdminService {
    PageResponse<CustomerAdminDto> getCustomers(String keyword, String status, int page, int size, String sortBy, String sortDir);
    CustomerAdminDto getCustomerById(Long id);
    CustomerAdminDto createCustomer(CustomerAdminRequest request);
    CustomerAdminDto updateCustomer(Long id, CustomerAdminRequest request);
    void toggleCustomerStatus(Long id);
    void softDeleteCustomer(Long id);
}