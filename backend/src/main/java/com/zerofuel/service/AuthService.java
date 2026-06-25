package com.zerofuel.service;

import com.zerofuel.dto.request.SendOtpRequest;
import com.zerofuel.dto.request.VerifyOtpRequest;
import com.zerofuel.dto.response.ApiResponse;
import com.zerofuel.dto.response.AuthResponse;

public interface AuthService {
    ApiResponse sendOtp(SendOtpRequest request);
    AuthResponse verifyOtp(VerifyOtpRequest request);
}
