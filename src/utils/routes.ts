// src/utils/routes.ts

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  TRANSACTION: "/transactions",
  GOALS: "/goals",
  PROFILE: "/profile",
  FINGERPRINT: "/fingerprint-activation",
} as const;

// Menjadikan ROUTES tidak bisa diubah (read-only) untuk mencegah bug typo
