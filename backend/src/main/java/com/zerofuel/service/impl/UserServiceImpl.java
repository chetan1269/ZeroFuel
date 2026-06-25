package com.zerofuel.service.impl;

import com.zerofuel.dto.response.ApiResponse;
import com.zerofuel.entity.User;
import com.zerofuel.enums.UserStatus;
import com.zerofuel.exception.ResourceNotFoundException;
import com.zerofuel.repository.UserRepository;
import com.zerofuel.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public ApiResponse uploadKyc(String phoneNumber, MultipartFile licenseDoc, MultipartFile aadhaarDoc, MultipartFile selfieDoc) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // In a real app, upload these to AWS S3 / Cloudinary and save the URLs
        // For MVP, we will mock the URLs
        String licenseUrl = "https://mock-storage.com/" + UUID.randomUUID() + "-license.jpg";
        String aadhaarUrl = "https://mock-storage.com/" + UUID.randomUUID() + "-aadhaar.jpg";
        String selfieUrl = "https://mock-storage.com/" + UUID.randomUUID() + "-selfie.jpg";

        user.setLicenseDocumentUrl(licenseUrl);
        user.setAadhaarDocumentUrl(aadhaarUrl);
        user.setSelfieUrl(selfieUrl);
        
        user.setStatus(UserStatus.KYC_UNDER_REVIEW);
        
        // MVP: Auto-verify KYC for testing purposes immediately, or leave as UNDER_REVIEW
        // Let's leave it as UNDER_REVIEW, the frontend has a pending screen.
        // But since there's no admin panel to approve it, let's auto-verify it for a smoother flow.
        user.setStatus(UserStatus.KYC_VERIFIED);
        
        userRepository.save(user);
        
        log.info("KYC documents uploaded for user {}", phoneNumber);
        
        return new ApiResponse("KYC documents uploaded successfully");
    }

    @Override
    public User getUserProfile(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
