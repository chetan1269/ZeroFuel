import { create } from 'zustand';

export type UserStatus = 'ACTIVE' | 'PENDING_KYC' | 'REJECTED';

export type User = {
  id: string;
  phoneNumber: string;
  name: string;
  status: UserStatus;
  walletBalance: number;
  avatarUrl?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  pendingPhone: string | null;
  setPendingPhone: (p: string) => void;
  loginSuccess: (token: string, user: User) => void;
  setKycSubmitted: () => void;
  approveKyc: () => void;
  logout: () => void;
  topUp: (amount: number) => void;
  spend: (amount: number) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  pendingPhone: null,
  setPendingPhone: (p) => set({ pendingPhone: p }),
  loginSuccess: (token, user) => set({ token, user, pendingPhone: null }),
  setKycSubmitted: () =>
    set((s) => (s.user ? { user: { ...s.user, status: 'PENDING_KYC' } } : s)),
  approveKyc: () =>
    set((s) => (s.user ? { user: { ...s.user, status: 'ACTIVE' } } : s)),
  logout: () => set({ token: null, user: null, pendingPhone: null }),
  topUp: (amount) =>
    set((s) => (s.user ? { user: { ...s.user, walletBalance: s.user.walletBalance + amount } } : s)),
  spend: (amount) =>
    set((s) =>
      s.user ? { user: { ...s.user, walletBalance: Math.max(0, s.user.walletBalance - amount) } } : s
    ),
}));
