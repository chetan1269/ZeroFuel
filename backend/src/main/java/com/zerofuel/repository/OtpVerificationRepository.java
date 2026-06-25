package com.zerofuel.repository;

import com.zerofuel.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    java.util.List<OtpVerification> findByPhoneNumberAndIsUsedFalse(String phoneNumber);

    /** Fetches the latest unused OTP for a phone number. */
    Optional<OtpVerification> findTopByPhoneNumberAndIsUsedFalseOrderByCreatedAtDesc(String phoneNumber);

    /** Cleans up stale expired OTPs (run via @Scheduled task). */
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :cutoff")
    int deleteExpiredOtps(@Param("cutoff") LocalDateTime cutoff);
}
