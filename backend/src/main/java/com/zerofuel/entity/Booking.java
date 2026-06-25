package com.zerofuel.entity;

import com.zerofuel.enums.BikeCondition;
import com.zerofuel.enums.BookingStatus;
import com.zerofuel.enums.RentalPlanType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a single rental booking from confirmation through settlement.
 *
 * A booking ties a {@link User} to a {@link Bike} for a chosen {@link RentalPlanType}.
 * It captures every phase of the rental lifecycle:
 *   1. Payment confirmation  → CONFIRMED
 *   2. Pickup QR scan        → ACTIVE  (rentalStartTime set)
 *   3. Return QR scan        → RETURN_INITIATED (returnTime set, conditionPhoto uploaded)
 *   4. Deposit settled       → COMPLETED (depositRefundedPaise calculated)
 */
@Entity
@Table(
    name = "bookings",
    indexes = {
        @Index(name = "idx_booking_user",   columnList = "user_id"),
        @Index(name = "idx_booking_bike",   columnList = "bike_id"),
        @Index(name = "idx_booking_status", columnList = "status"),
        @Index(name = "idx_booking_ref",    columnList = "booking_reference", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    // ── Primary Key ──────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Human-readable unique reference (e.g., "ZF-20240615-00042").
     * Shown on receipts, support tickets, and the active rental screen.
     */
    @Column(name = "booking_reference", nullable = false, unique = true, length = 30)
    private String bookingReference;

    // ── Core Relationships ───────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_booking_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bike_id", nullable = false, foreignKey = @ForeignKey(name = "fk_booking_bike"))
    private Bike bike;

    /**
     * The hub where the bike was picked up. Recorded at QR scan time.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_hub_id", foreignKey = @ForeignKey(name = "fk_booking_pickup_hub"))
    private Hub pickupHub;

    /**
     * The hub where the bike was returned. May differ from pickupHub in future
     * multi-hub drop-off scenarios.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_hub_id", foreignKey = @ForeignKey(name = "fk_booking_return_hub"))
    private Hub returnHub;

    // ── Plan & Pricing Snapshot ───────────────────────────────────────────────
    // Prices are snapshotted at booking time so historical records are unaffected
    // by future price changes on the Bike entity.

    @Enumerated(EnumType.STRING)
    @Column(name = "rental_plan", nullable = false, length = 20)
    private RentalPlanType rentalPlan;

    /** Rental cost (INR) snapshotted from bike pricing at booking time. */
    @Column(name = "rental_amount_inr", nullable = false, precision = 8, scale = 2)
    private BigDecimal rentalAmountInr;

    /** Security deposit collected at booking (INR). */
    @Column(name = "deposit_collected_inr", nullable = false, precision = 8, scale = 2)
    private BigDecimal depositCollectedInr;

    /**
     * Total amount charged to the user at booking:
     * rentalAmountInr + depositCollectedInr + any convenience fees.
     */
    @Column(name = "total_charged_inr", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalChargedInr;

    // ── Payment Gateway ───────────────────────────────────────────────────────

    /** Razorpay / Stripe order ID for linking back to the payment gateway. */
    @Column(name = "payment_gateway_order_id", length = 100)
    private String paymentGatewayOrderId;

    /** Gateway's payment ID received in the webhook on success. */
    @Column(name = "payment_gateway_payment_id", length = 100)
    private String paymentGatewayPaymentId;

    // ── Lifecycle Timestamps ──────────────────────────────────────────────────

    /** When payment was confirmed and the booking moved to CONFIRMED. */
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    /**
     * When the rider scanned the pickup QR and the rental timer started.
     * Null until the ACTIVE state is reached.
     */
    @Column(name = "rental_start_time")
    private LocalDateTime rentalStartTime;

    /**
     * The contractual end time calculated from rentalStartTime + plan duration.
     * Used to detect overdue returns.
     */
    @Column(name = "rental_end_time")
    private LocalDateTime rentalEndTime;

    /**
     * When the return hub QR was scanned (RETURN_INITIATED transition).
     */
    @Column(name = "actual_return_time")
    private LocalDateTime actualReturnTime;

    // ── Return & Settlement ───────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "bike_condition_at_return", length = 20)
    private BikeCondition bikeConditionAtReturn;

    /** URL to the condition photo uploaded by the user at return. */
    @Column(name = "condition_photo_url", length = 512)
    private String conditionPhotoUrl;

    /**
     * Amount of deposit refunded to the user (INR) after condition assessment.
     * 0 if MAJOR_DAMAGE; partial if MINOR_DAMAGE; full if GOOD.
     */
    @Column(name = "deposit_refunded_inr", precision = 8, scale = 2)
    private BigDecimal depositRefundedInr;

    /** Admin/system note about any damage deduction. */
    @Column(name = "settlement_notes", length = 500)
    private String settlementNotes;

    // ── Booking Status ────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING_PAYMENT;

    // ── Audit ─────────────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
