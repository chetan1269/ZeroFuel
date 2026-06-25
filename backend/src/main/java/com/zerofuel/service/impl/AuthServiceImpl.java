package com.zerofuel.service.impl;

import com.zerofuel.dto.request.SendOtpRequest;
import com.zerofuel.dto.request.VerifyOtpRequest;
import com.zerofuel.dto.response.ApiResponse;
import com.zerofuel.dto.response.AuthResponse;
import com.zerofuel.entity.OtpVerification;
import com.zerofuel.entity.User;
import com.zerofuel.enums.UserStatus;
import com.zerofuel.exception.BadRequestException;
import com.zerofuel.exception.UnauthorizedException;
import com.zerofuel.repository.OtpVerificationRepository;
import com.zerofuel.repository.UserRepository;
import com.zerofuel.security.JwtTokenProvider;
import com.zerofuel.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public ApiResponse sendOtp(SendOtpRequest request) {
        String phoneNumber = request.getPhoneNumber();
        
        // Disable any previous active OTPs for this phone number
        otpVerificationRepository.findByPhoneNumberAndIsUsedFalse(phoneNumber)
                .forEach(existing -> {
                    existing.setIsUsed(true);
                    otpVerificationRepository.save(existing);
                });

        // Generate a 6-digit OTP (hardcoded for MVP demo purposes to "123456" if in dev mode)
        String otpCode = "123456"; 
        
        OtpVerification otpVerification = OtpVerification.builder()
                .phoneNumber(phoneNumber)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();
                
        otpVerificationRepository.save(otpVerification);
        
        log.info("Sent OTP {} to phone {}", otpCode, phoneNumber);
        
        return new ApiResponse("OTP sent successfully");
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String phoneNumber = request.getPhoneNumber();
        String otpCode = request.getOtpCode();
        
        OtpVerification otpVerification = otpVerificationRepository
                .findTopByPhoneNumberAndIsUsedFalseOrderByCreatedAtDesc(phoneNumber)
                .orElseThrow(() -> new UnauthorizedException("No active OTP found for this number"));
                
        if (otpVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpVerification.setIsUsed(true);
            otpVerificationRepository.save(otpVerification);
            throw new UnauthorizedException("OTP has expired");
        }
        
        if (!otpVerification.getOtpCode().equals(otpCode)) {
            throw new UnauthorizedException("Invalid OTP code");
        }
        
        // Mark OTP as used
        otpVerification.setIsUsed(true);
        otpVerificationRepository.save(otpVerification);
        
        // Find or create user
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .phoneNumber(phoneNumber)
                            .status(UserStatus.PENDING_KYC)
                            .build();
                    return userRepository.save(newUser);
                });
                
        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getPhoneNumber());
        
        return new AuthResponse(token, user);
    }
}
