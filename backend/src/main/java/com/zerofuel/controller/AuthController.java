package com.zerofuel.controller;

import com.zerofuel.dto.request.SendOtpRequest;
import com.zerofuel.dto.request.VerifyOtpRequest;
import com.zerofuel.dto.response.ApiResponse;
import com.zerofuel.dto.response.AuthResponse;
import com.zerofuel.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.zerofuel.service.UserService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendOtp(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/kyc/upload")
    public ResponseEntity<ApiResponse> uploadKyc(
            @AuthenticationPrincipal String phoneNumber,
            @RequestParam("licenseDoc") MultipartFile licenseDoc,
            @RequestParam("aadhaarDoc") MultipartFile aadhaarDoc,
            @RequestParam("selfieDoc") MultipartFile selfieDoc) {
        return ResponseEntity.ok(userService.uploadKyc(phoneNumber, licenseDoc, aadhaarDoc, selfieDoc));
    }
}
