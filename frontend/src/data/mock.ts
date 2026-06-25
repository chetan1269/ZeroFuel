// Mock data for ZeroFuel — replace with real API responses when backend URL is wired.

export type Vehicle = {
  id: string;
  model: string;
  brand: string;
  battery: number; // 0-100
  rangeKm: number;
  pricePerMin: number; // INR
  latitude: number;
  longitude: number;
  hubId?: string;
  imageUrl: string;
};

export type Hub = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  availableEvs: number;
  totalSlots: number;
  address: string;
};

// Centered around Bangalore (Indiranagar) for a nice city demo.
export const HOME_REGION = {
  latitude: 12.9716,
  longitude: 77.6412,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export const MOCK_HUBS: Hub[] = [
  {
    id: 'hub-1',
    name: 'Indiranagar 100ft Road',
    latitude: 12.9719,
    longitude: 77.6412,
    availableEvs: 4,
    totalSlots: 8,
    address: '100 Feet Rd, Indiranagar, Bengaluru',
  },
  {
    id: 'hub-2',
    name: 'Koramangala 5th Block',
    latitude: 12.9352,
    longitude: 77.6245,
    availableEvs: 2,
    totalSlots: 6,
    address: '5th Block, Koramangala, Bengaluru',
  },
  {
    id: 'hub-3',
    name: 'MG Road Metro',
    latitude: 12.9756,
    longitude: 77.6066,
    availableEvs: 5,
    totalSlots: 10,
    address: 'MG Road Metro, Bengaluru',
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    model: 'Ather 450X',
    brand: 'Ather',
    battery: 86,
    rangeKm: 92,
    pricePerMin: 2,
    latitude: 12.9722,
    longitude: 77.6418,
    hubId: 'hub-1',
    imageUrl:
      'https://images.unsplash.com/photo-1611956292173-c2445aa61709?crop=entropy&cs=srgb&fm=jpg&w=600&q=80',
  },
  {
    id: 'veh-2',
    model: 'Ola S1 Pro',
    brand: 'Ola',
    battery: 62,
    rangeKm: 70,
    pricePerMin: 2.5,
    latitude: 12.9701,
    longitude: 77.6395,
    hubId: 'hub-1',
    imageUrl:
      'https://images.unsplash.com/photo-1611956292173-c2445aa61709?crop=entropy&cs=srgb&fm=jpg&w=600&q=80',
  },
  {
    id: 'veh-3',
    model: 'TVS iQube',
    brand: 'TVS',
    battery: 45,
    rangeKm: 48,
    pricePerMin: 1.8,
    latitude: 12.9358,
    longitude: 77.6242,
    hubId: 'hub-2',
    imageUrl:
      'https://images.unsplash.com/photo-1611956292173-c2445aa61709?crop=entropy&cs=srgb&fm=jpg&w=600&q=80',
  },
  {
    id: 'veh-4',
    model: 'Bajaj Chetak',
    brand: 'Bajaj',
    battery: 78,
    rangeKm: 85,
    pricePerMin: 2.2,
    latitude: 12.9760,
    longitude: 77.6062,
    hubId: 'hub-3',
    imageUrl:
      'https://images.unsplash.com/photo-1611956292173-c2445aa61709?crop=entropy&cs=srgb&fm=jpg&w=600&q=80',
  },
  {
    id: 'veh-5',
    model: 'Ather 450X',
    brand: 'Ather',
    battery: 92,
    rangeKm: 98,
    pricePerMin: 2,
    latitude: 12.9748,
    longitude: 77.6072,
    hubId: 'hub-3',
    imageUrl:
      'https://images.unsplash.com/photo-1611956292173-c2445aa61709?crop=entropy&cs=srgb&fm=jpg&w=600&q=80',
  },
];

export type Rental = {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  startedAt: number; // ms
  endedAt?: number;
  durationMin: number;
  cost: number;
  status: 'ACTIVE' | 'COMPLETED';
};

export const MOCK_HISTORY: Rental[] = [
  {
    id: 'r-101',
    vehicleId: 'veh-1',
    vehicleModel: 'Ather 450X',
    startedAt: Date.now() - 1000 * 60 * 60 * 26,
    endedAt: Date.now() - 1000 * 60 * 60 * 25,
    durationMin: 32,
    cost: 64,
    status: 'COMPLETED',
  },
  {
    id: 'r-100',
    vehicleId: 'veh-3',
    vehicleModel: 'TVS iQube',
    startedAt: Date.now() - 1000 * 60 * 60 * 72,
    endedAt: Date.now() - 1000 * 60 * 60 * 71,
    durationMin: 18,
    cost: 32.4,
    status: 'COMPLETED',
  },
  {
    id: 'r-099',
    vehicleId: 'veh-4',
    vehicleModel: 'Bajaj Chetak',
    startedAt: Date.now() - 1000 * 60 * 60 * 120,
    endedAt: Date.now() - 1000 * 60 * 60 * 119,
    durationMin: 45,
    cost: 99,
    status: 'COMPLETED',
  },
];
