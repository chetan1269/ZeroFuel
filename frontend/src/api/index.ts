// Mock API layer for ZeroFuel. Wire to your Spring Boot backend by replacing
// the function bodies and using EXPO_PUBLIC_BACKEND_URL.
//
// Endpoint contract reference (Spring Boot):
//   POST /api/auth/request-otp        { phoneNumber }                       -> 200
//   POST /api/auth/verify-otp         VerifyOtpRequest{phoneNumber,otpCode} -> AuthResponse{token, user}
//   POST /api/users/kyc               multipart                              -> { status: "PENDING_KYC" }
//   GET  /api/vehicles/nearby?lat&lng                                       -> Vehicle[]
//   GET  /api/hubs/nearby?lat&lng                                           -> Hub[]
//   POST /api/rentals                 { vehicleId }                          -> Rental
//   POST /api/rentals/{id}/end                                              -> Rental
//   GET  /api/rentals                                                       -> Rental[]

import { MOCK_HUBS, MOCK_VEHICLES, Vehicle, Hub } from '@/src/data/mock';

const DEV_OTP = '123456';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    phoneNumber: string;
    name: string;
    status: 'ACTIVE' | 'PENDING_KYC' | 'REJECTED';
    walletBalance: number;
  };
};

export async function requestOtp(phoneNumber: string): Promise<{ ok: boolean }> {
  await delay(700);
  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error('Enter a valid 10-digit phone number');
  }
  return { ok: true };
}

export async function verifyOtp(phoneNumber: string, otpCode: string): Promise<AuthResponse> {
  await delay(700);
  if (otpCode !== DEV_OTP) {
    throw new Error('Invalid OTP. Try 123456 in dev mode.');
  }
  return {
    token: `mock-jwt-${Date.now()}`,
    user: {
      id: 'u-1',
      phoneNumber,
      name: 'Rider',
      status: 'PENDING_KYC',
      walletBalance: 250,
    },
  };
}

export async function submitKyc(_payload: { licenseUri?: string; aadhaarUri?: string }) {
  await delay(900);
  return { status: 'PENDING_KYC' as const };
}

export async function fetchNearbyVehicles(): Promise<Vehicle[]> {
  await delay(300);
  return MOCK_VEHICLES;
}

export async function fetchNearbyHubs(): Promise<Hub[]> {
  await delay(300);
  return MOCK_HUBS;
}
