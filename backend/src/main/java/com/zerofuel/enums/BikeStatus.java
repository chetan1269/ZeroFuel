package com.zerofuel.enums;

/**
 * Operational state of a bike within the fleet.
 */
public enum BikeStatus {

    /** Bike is at a hub, charged, and ready for rental. */
    AVAILABLE,

    /** Bike is currently booked and with a rider. */
    RENTED,

    /** Bike is reserved/awaiting pickup (booking confirmed, not yet scanned). */
    RESERVED,

    /** Bike is offline for scheduled maintenance. */
    UNDER_MAINTENANCE,

    /** Bike is retired from the active fleet. */
    DECOMMISSIONED
}
