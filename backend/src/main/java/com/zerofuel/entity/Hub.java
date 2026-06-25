package com.zerofuel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a physical ZeroFuel hub (charging + parking station).
 *
 * A hub has a geo-location so the mobile app can display nearby hubs on a map,
 * and maintains a list of bikes currently docked at it.
 */
@Entity
@Table(
    name = "hubs",
    indexes = {
        @Index(name = "idx_hub_location", columnList = "latitude, longitude")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hub {

    // ── Primary Key ──────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Identity & Location ──────────────────────────────────────────────────

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    /**
     * Human-readable address string for display on the bike detail screen.
     */
    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    /**
     * WGS-84 decimal degrees. Precision(10,7) supports ~1cm accuracy.
     */
    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    // ── Operational Metadata ─────────────────────────────────────────────────

    /** Total number of parking slots at this hub. */
    @Column(name = "total_slots", nullable = false)
    private Integer totalSlots;

    /** Whether this hub is currently accepting rentals and returns. */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Operating hours displayed on the hub detail sheet.
     * Format: "06:00 - 22:00" or "24x7".
     */
    @Column(name = "operating_hours", length = 50)
    private String operatingHours;

    /** URL to a representative photo of the hub for the list/detail UI. */
    @Column(name = "image_url", length = 512)
    private String imageUrl;

    // ── Relationships ────────────────────────────────────────────────────────

    /**
     * Bikes currently assigned to (docked at) this hub.
     * A bike's homeHub changes only on admin reassignment, not on rental.
     */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "homeHub", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Bike> bikes = new ArrayList<>();

    // ── Audit ────────────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
