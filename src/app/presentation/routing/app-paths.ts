/** Single source of truth for absolute in-app URLs used in navigation code. */
export const AppPaths = {
  dashboard: '/',
  exercises: '/exercises',
  foods: '/foods',
  login: '/auth/login',
  accessDenied: '/auth/access-denied',
  error: '/auth/error',
  notFound: '/not-found',
} as const;
