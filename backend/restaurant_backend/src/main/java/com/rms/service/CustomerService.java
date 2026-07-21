package com.rms.service;

import com.rms.dto.ChangePasswordRequest;
import com.rms.dto.CustomerProfileDto;
import com.rms.dto.UpdateProfileRequest;

public interface CustomerService {
    CustomerProfileDto getCurrentCustomerProfile(String username);
    CustomerProfileDto updateProfile(String username, UpdateProfileRequest request);
    void changePassword(String username, ChangePasswordRequest request);
}