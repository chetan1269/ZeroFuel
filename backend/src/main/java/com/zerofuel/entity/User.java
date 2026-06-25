package com.zerofuel.entity;

import com.zerofuel.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core user entity. Represents a rider registered on the ZeroFuel platform.
 *
 * Authentication is phone + OTP based; no password stored.
 * KYC state is managed via {@link UserStatus} and the document URL fields.
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_phone", columnList = "phone_number", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // ── Primary Key ──────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Identity & Contact ───────────────────────────────────────────────────

    @Column(name = "phone_number", nullable = false, unique = true, length = 15)
    private String phoneNumber;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "email", length = 150)
    private String email;

    // ── KYC Documents (stored as cloud-storage URL strings) ──────────────────

    /**
     * URL to the uploaded driving license image (S3 / GCS / Cloudinary).
     * Null until the user completes the KYC upload step.
     */
    @Column(name = "license_document_url", length = 512)
    private String licenseDocumentUrl;

    /**
     * URL to the Aadhaar card image (front/back composite or separate).
     */
    @Column(name = "aadhaar_document_url", length = 512)
    private String aadhaarDocumentUrl;

    /**
     * URL to the live selfie / identity photo taken during KYC.
     */
    @Column(name = "selfie_url", length = 512)
    private String selfieUrl;

    // ── Account Status ───────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING_KYC;

    /**
     * Admin-facing note populated when KYC is rejected, explaining the reason.
     */
    @Column(name = "kyc_rejection_reason", length = 500)
    private String kycRejectionReason;

    // ── Gamification / Engagement ────────────────────────────────────────────

    /**
     * Cumulative CO₂ saved in grams, updated after each completed rental.
     * Displayed on the Home screen as the "fuel saved" stat.
     */
    @Column(name = "total_co2_saved_grams", nullable = false)
    @Builder.Default
    private Long totalCo2SavedGrams = 0L;

    /**
     * Cumulative money saved (in paise) compared to petrol equivalent.
     * Used for the "earnings saved" display on the Profile screen.
     */
    @Column(name = "total_money_saved_paise", nullable = false)
    @Builder.Default
    private Long totalMoneySavedPaise = 0L;

    // ── Relationships ────────────────────────────────────────────────────────

    /**
     * All bookings made by this user, ordered most-recent first.
     * Loaded lazily to avoid N+1 on user list endpoints.
     */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    // ── Audit Timestamps ─────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
