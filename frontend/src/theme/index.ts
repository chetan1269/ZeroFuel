// Theme tokens for ZeroFuel based on /app/design_guidelines.json
export type ThemeMode = 'light' | 'dark';

export const palette = {
  brand: '#1ED760',
  brandOn: '#000000',
  brandSecondary: '#12B34B',
  brandTertiary: 'rgba(30, 215, 96, 0.15)',
  warning: '#FFB800',
  error: '#FF3B30',
};

export const lightTheme = {
  mode: 'light' as ThemeMode,
  colors: {
    surface: '#FFFFFF',
    onSurface: '#111111',
    surfaceSecondary: '#F8F8F8',
    onSurfaceSecondary: '#555555',
    surfaceTertiary: '#EAEAEA',
    onSurfaceTertiary: '#777777',
    surfaceInverse: '#000000',
    onSurfaceInverse: '#FFFFFF',
    brand: palette.brand,
    onBrand: palette.brandOn,
    brandSecondary: palette.brandSecondary,
    brandTertiary: palette.brandTertiary,
    border: '#E5E5E5',
    borderStrong: '#CCCCCC',
    divider: '#F0F0F0',
    success: palette.brand,
    warning: palette.warning,
    error: palette.error,
    overlay: 'rgba(0,0,0,0.4)',
    glass: 'rgba(255,255,255,0.85)',
    mapBg: '#E8EEF1',
  },
};

export const darkTheme = {
  mode: 'dark' as ThemeMode,
  colors: {
    surface: '#0B0B0B',
    onSurface: '#FFFFFF',
    surfaceSecondary: '#161616',
    onSurfaceSecondary: '#CCCCCC',
    surfaceTertiary: '#242424',
    onSurfaceTertiary: '#999999',
    surfaceInverse: '#FFFFFF',
    onSurfaceInverse: '#000000',
    brand: palette.brand,
    onBrand: palette.brandOn,
    brandSecondary: palette.brandSecondary,
    brandTertiary: 'rgba(30, 215, 96, 0.2)',
    border: '#262626',
    borderStrong: '#3A3A3A',
    divider: '#1C1C1C',
    success: palette.brand,
    warning: palette.warning,
    error: palette.error,
    overlay: 'rgba(0,0,0,0.6)',
    glass: 'rgba(20,20,20,0.85)',
    mapBg: '#1B1F23',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xl2: 32,
  xl3: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  fontFamily: undefined as string | undefined, // system; can wire Plus Jakarta Sans via expo-font later
  scale: { sm: 12, base: 14, lg: 16, xl: 20, xl2: 24, xl3: 32 },
};

export type Theme = typeof lightTheme;
