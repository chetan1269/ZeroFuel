package com.zerofuel.enums;

/**
 * Full lifecycle states for a rental booking.
 *
 * State machine:
 *   PENDING_PAYMENT → CONFIRMED → ACTIVE → RETURN_INITIATED → COMPLETED
 *                                       ↘ CANCELLED
 *                                          PAYMENT_FAILED
 */
public enum BookingStatus {

    /** Order created; awaiting payment gateway confirmation. */
    PENDING_PAYMENT,

    /** Payment successful; bike reserved. User can scan QR to pick up. */
    CONFIRMED,

    /** User has scanned QR and rental timer is running. */
    ACTIVE,

    /** User has initiated return at a hub (QR scanned at hub). */
    RETURN_INITIATED,

    /** Return confirmed, condition recorded, deposit settled. */
    COMPLETED,

    /** Booking cancelled before activation (refund triggered). */
    CANCELLED,

    /** Payment gateway returned failure; booking aborted. */
    PAYMENT_FAILED
}
