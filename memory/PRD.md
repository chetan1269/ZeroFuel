# ZeroFuel — PRD

## Product
ZeroFuel is a **map-first EV (electric vehicle) rental app** for urban India, modelled on Uber/Ola/Lime micro-mobility experiences. Users find nearby EVs on a live map, reserve or scan-to-unlock, ride, and end via swipe-to-end. The user's Spring Boot backend powers auth, KYC, rentals and wallet.

## Stack
- **Mobile**: React Native / Expo SDK 54, expo-router (file-based).
- **State**: Zustand stores for auth, rental, theme.
- **Map**: `react-native-maps` on native, custom web stub for preview.
- **Bottom Sheets**: `@gorhom/bottom-sheet`.
- **Animation**: react-native-reanimated, react-native-gesture-handler.
- **Backend (user-provided)**: Spring Boot REST — base URL pending; mocked in `/app/frontend/src/api/index.ts` until wired.

## Implemented Screens
1. **Splash** (`/`) — animated wordmark, routes to auth or home based on token.
2. **Phone Login** (`/(auth)/phone`) — `+91` pill input, validates 10 digits.
3. **OTP** (`/(auth)/otp`) — 6-digit input with auto-advance, resend timer, **Dev mode OTP: 123456** banner.
4. **KYC** (`/(auth)/kyc`) — DL + Aadhaar upload via `expo-image-picker`. Submit → PENDING_KYC.
5. **Home Map** (`/(main)/home`) — Full-screen map with custom EV (battery %) and Hub (count) markers, floating glass search pill + avatar + theme toggle, draggable bottom sheet (15% → 55%), prominent "Scan to Unlock" FAB.
6. **Vehicle Details (sheet expansion)** — Battery progress, range, ₹/min, **Reserve Vehicle** CTA (disabled while PENDING_KYC).
7. **Hub Details (sheet expansion)** — Available EVs, slots, distance, Get Directions.
8. **Active Rental** (`/(main)/active`) — Live map, locked sheet with ticking duration/cost/range, **Swipe to End** slider with haptics.
9. **QR Scan** (`/(main)/qr-scan`) — `expo-camera` viewfinder with green corner frame, simulate-scan fallback.
10. **Profile** (`/(main)/profile`) — Wallet card, KYC status pill, list rows to History/Wallet/Help/Theme/Logout.
11. **Wallet** (`/(main)/wallet`) — Balance card, quick top-up grid, UPI payment method.
12. **Ride History** (`/(main)/history`) — Chronological completed rides with cost.
13. **Help & Support** (`/(main)/help`) — Live Chat/Call/Email actions + FAQ.

## API Contract (to match Spring Boot)
```
POST /api/auth/request-otp   { phoneNumber }                       -> 200
POST /api/auth/verify-otp    { phoneNumber, otpCode }              -> { token, user }
POST /api/users/kyc          multipart(license, aadhaar)            -> { status: "PENDING_KYC" }
GET  /api/vehicles/nearby?lat&lng                                   -> Vehicle[]
GET  /api/hubs/nearby?lat&lng                                       -> Hub[]
POST /api/rentals            { vehicleId }                          -> Rental
POST /api/rentals/{id}/end                                          -> Rental
GET  /api/rentals                                                   -> Rental[]
```

## Theming
Light & Dark mode with neon green `#1ED760` brand accent, toggleable from Phone screen and Home map header.

## Open Items
- Wire real backend base URL into `/app/frontend/src/api/index.ts`.
- Replace mock OTP gate (`123456`) with the server's response check.
- Plug Google Maps API key in `app.json` for production iOS/Android builds.
