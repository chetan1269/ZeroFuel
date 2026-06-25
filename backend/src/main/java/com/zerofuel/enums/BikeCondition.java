package com.zerofuel.enums;

/**
 * Condition of the bike as assessed at return time.
 * Used to determine deposit settlement.
 */
public enum BikeCondition {

    /** No visible damage; full deposit refunded. */
    GOOD,

    /** Minor cosmetic damage; partial deposit retained. */
    MINOR_DAMAGE,

    /** Significant mechanical or structural damage; full deposit retained and claim raised. */
    MAJOR_DAMAGE
}
