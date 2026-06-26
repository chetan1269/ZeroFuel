import { Vehicle, Hub } from '@/src/data/mock';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

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

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.message ?? body?.error ?? msg;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function requestOtp(phoneNumber: string): Promise<{ ok: boolean }> {
  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error('Enter a valid 10-digit phone number');
  }
  await apiFetch('/api/v1/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
  return { ok: true };
}

export async function verifyOtp(
  phoneNumber: string,
  otpCode: string,
): Promise<AuthResponse> {
  const data = await apiFetch<{ token: string; user: Record<string, unknown> }>(
    '/api/v1/auth/verify-otp',
    {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otpCode }),
    },
  );
  return {
    token: data.token,
    user: {
      id: String(data.user.id),
      phoneNumber: String(data.user.phoneNumber),
      name: String(data.user.fullName ?? data.user.phoneNumber),
      status: (data.user.status as 'ACTIVE' | 'PENDING_KYC' | 'REJECTED') ?? 'PENDING_KYC',
      walletBalance: 0,
    },
  };
}

export async function submitKyc(_payload: { licenseUri?: string; aadhaarUri?: string }) {
  return { status: 'PENDING_KYC' as const };
}

export async function fetchNearbyHubs(
  latitude = 12.9716,
  longitude = 77.6412,
  token?: string | null,
): Promise<Hub[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    radiusKm: '15',
  });
  const data = await apiFetch<Array<Record<string, unknown>>>(
    `/api/v1/hubs/nearby?${params}`,
    {},
    token,
  );
  return data.map((h) => ({
    id: String(h.id),
    name: String(h.name ?? ''),
    latitude: Number(h.latitude),
    longitude: Number(h.longitude),
    availableEvs: Number(h.availableCount ?? 0),
    totalSlots: Number(h.totalSlots ?? 0),
    address: String(h.address ?? ''),
  }));
}

export async function fetchNearbyVehicles(
  latitude = 12.9716,
  longitude = 77.6412,
  token?: string | null,
): Promise<Vehicle[]> {
  const hubs = await fetchNearbyHubs(latitude, longitude, token);
  const vehicleArrays = await Promise.all(
    hubs.map((hub) =>
      apiFetch<Array<Record<string, unknown>>>(
        `/api/v1/hubs/${hub.id}/bikes`,
        {},
        token,
      ).then((bikes) =>
        bikes.map((b) => ({
          id: String(b.id),
          model: String(b.modelName ?? 'EV Bike'),
          brand: String(b.brand ?? 'ZeroFuel'),
          battery: Number(b.batteryPercentage ?? 80),
          rangeKm: Number(b.rangeKm ?? 60),
          pricePerMin: Number(b.perMinutePriceInr ?? 2),
          latitude: hub.latitude,
          longitude: hub.longitude,
          hubId: hub.id,
          imageUrl: String(b.imageUrl ?? ''),
        })),
      ),
    ),
  );
  return vehicleArrays.flat();
}
