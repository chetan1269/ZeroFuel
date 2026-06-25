import { create } from 'zustand';
import { darkTheme, lightTheme, Theme, ThemeMode } from '@/src/theme';

type ThemeState = {
  mode: ThemeMode;
  theme: Theme;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  theme: lightTheme,
  toggle: () =>
    set((s) => {
      const next = s.mode === 'light' ? 'dark' : 'light';
      return { mode: next, theme: next === 'light' ? lightTheme : darkTheme };
    }),
  setMode: (m) => set({ mode: m, theme: m === 'light' ? lightTheme : darkTheme }),
}));

export const useTheme = () => useThemeStore((s) => s.theme);
