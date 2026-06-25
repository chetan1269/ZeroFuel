package com.zerofuel.service;

import com.zerofuel.dto.response.ApiResponse;
import com.zerofuel.entity.User;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    ApiResponse uploadKyc(String phoneNumber, MultipartFile licenseDoc, MultipartFile aadhaarDoc, MultipartFile selfieDoc);
    User getUserProfile(String phoneNumber);
}
