package com.zerofuel.entity;

import com.zerofuel.enums.BikeStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single EV bike in the ZeroFuel fleet.
 *
 * Each bike belongs to a {@link Hub} as its home base and carries
 * pricing, specs, and a unique QR identifier for scan-based pickup/return.
 */
@Entity
@Table(
    name = "bikes",
    indexes = {
        @Index(name = "idx_bike_qr_code", columnList = "qr_code", unique = true),
        @Index(name = "idx_bike_status", columnList = "status"),
        @Index(name = "idx_bike_hub", columnList = "home_hub_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bike {

    // ── Primary Key ──────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Identification ───────────────────────────────────────────────────────

    /**
     * Internal registration / asset tag (e.g., "ZF-MH-001").
     */
    @Column(name = "registration_number", nullable = false, unique = true, length = 30)
    private String registrationNumber;

    /**
     * UUID embedded in the physical QR code sticker on the bike.
     * Scanned during pickup and return to identify the exact bike.
     */
    @Column(name = "qr_code", nullable = false, unique = true, length = 100)
    private String qrCode;

    // ── Model & Specs ────────────────────────────────────────────────────────

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    /** Manufacturer brand (e.g., "Ather", "Ola", "Bajaj"). */
    @Column(name = "brand", nullable = false, length = 60)
    private String brand;

    /** Full-charge range in kilometres. Used for informational display. */
    @Column(name = "range_km", nullable = false)
    private Integer rangeKm;

    /** Maximum speed in km/h. */
    @Column(name = "max_speed_kmph")
    private Integer maxSpeedKmph;

    /**
     * Battery charge level as a percentage (0-100).
     * Updated periodically via IoT telemetry (future scope).
     */
    @Column(name = "battery_percentage")
    private Integer batteryPercentage;

    /** URL to the bike's primary marketing/display photo. */
    @Column(name = "image_url", length = 512)
    private String imageUrl;

    // ── Pricing ──────────────────────────────────────────────────────────────

    @Column(name = "per_minute_price_inr", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal perMinutePriceInr = new BigDecimal("2.00");

    @Column(name = "hourly_price_inr", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal hourlyPriceInr = new BigDecimal("99.00");

    /**
     * Daily rental price in Indian Rupees (INR).
     * Stored as BigDecimal to avoid floating-point rounding issues.
     */
    @Column(name = "daily_price_inr", nullable = false, precision = 8, scale = 2)
    private BigDecimal dailyPriceInr;

    /**
     * Weekly rental price in INR. Typically offers a discount vs 7 × daily.
     */
    @Column(name = "weekly_price_inr", nullable = false, precision = 8, scale = 2)
    private BigDecimal weeklyPriceInr;

    /**
     * Refundable security deposit amount in INR collected at booking.
     */
    @Column(name = "deposit_amount_inr", nullable = false, precision = 8, scale = 2)
    private BigDecimal depositAmountInr;

    // ── Status & Hub ─────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private BikeStatus status = BikeStatus.AVAILABLE;

    /**
     * The hub this bike is assigned to. Updated by ops when the bike is
     * physically relocated. Does NOT change during a rental.
     */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_hub_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bike_hub"))
    private Hub homeHub;

    // ── Relationships ────────────────────────────────────────────────────────

    /** Full booking history for this bike. Used for utilisation analytics. */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "bike", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    // ── Audit ────────────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
