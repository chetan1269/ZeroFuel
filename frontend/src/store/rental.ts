import { create } from 'zustand';
import { MOCK_HISTORY, Rental, Vehicle } from '@/src/data/mock';

type ActiveRental = {
  rentalId: string;
  vehicle: Vehicle;
  startedAt: number; // ms epoch
};

type RentalState = {
  active: ActiveRental | null;
  history: Rental[];
  startRental: (v: Vehicle) => void;
  endRental: () => Rental | null;
};

export const useRentalStore = create<RentalState>((set, get) => ({
  active: null,
  history: MOCK_HISTORY,
  startRental: (v) =>
    set({
      active: {
        rentalId: `r-${Date.now()}`,
        vehicle: v,
        startedAt: Date.now(),
      },
    }),
  endRental: () => {
    const active = get().active;
    if (!active) return null;
    const durationMs = Date.now() - active.startedAt;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));
    const cost = Math.round(durationMin * active.vehicle.pricePerMin * 10) / 10;
    const rental: Rental = {
      id: active.rentalId,
      vehicleId: active.vehicle.id,
      vehicleModel: active.vehicle.model,
      startedAt: active.startedAt,
      endedAt: Date.now(),
      durationMin,
      cost,
      status: 'COMPLETED',
    };
    set((s) => ({ active: null, history: [rental, ...s.history] }));
    return rental;
  },
}));
