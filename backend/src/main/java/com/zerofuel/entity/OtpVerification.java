package com.zerofuel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Stores a one-time OTP for phone-number based authentication.
 *
 * Flow:
 *   POST /auth/send-otp  → creates/replaces this record for the phone.
 *   POST /auth/verify-otp → validates code + expiry, then issues JWT.
 *
 * Records are soft-expired (isUsed=true) rather than deleted to allow
 * audit trails and brute-force analysis.
 */
@Entity
@Table(
    name = "otp_verifications",
    indexes = {
        @Index(name = "idx_otp_phone", columnList = "phone_number")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    /** 6-digit OTP. Store hashed in production (e.g., BCrypt). */
    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    /** OTP becomes invalid after this timestamp. Default: 10 minutes. */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private Boolean isUsed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
