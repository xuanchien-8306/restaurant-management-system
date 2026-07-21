package com.rms.service;

import com.rms.dto.AuthResponse;
import com.rms.dto.LoginRequest;
import com.rms.dto.RegisterRequest;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}