package com.zerofuel.enums;

/**
 * Represents the lifecycle state of a user account,
 * driven primarily by KYC verification progress.
 */
public enum UserStatus {

    /** Account created; OTP verified. No KYC documents yet. */
    PENDING_KYC,

    /** KYC documents uploaded; awaiting admin/automated review. */
    KYC_UNDER_REVIEW,

    /** KYC approved. User can browse hubs and bikes. */
    KYC_VERIFIED,

    /** KYC rejected. User must re-upload documents. */
    KYC_REJECTED,

    /** Account suspended by admin (e.g., damage dispute). */
    SUSPENDED,

    /** Account permanently deactivated. */
    DEACTIVATED
}
