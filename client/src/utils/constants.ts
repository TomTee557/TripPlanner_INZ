// Constants for Trip Planner App

// Available pictures for trips
export const availablePictures = {
  'mountains': {
    name: 'Mountains',
    path: '/mountains.jpg'
  },
  'mountains-2': {
    name: 'Mountains 2',
    path: '/mountains-2.jpg'
  },
  'oriental': {
    name: 'Oriental',
    path: '/oriental.jpg'
  },
  'eiffel-tower': {
    name: 'Eiffel Tower',
    path: '/eiffel-tower.jpg'
  },
  'mountain-3': {
    name: 'Mountains 3',
    path: '/mountains-3.jpg'
  },
  'colosseum': {
    name: 'Colosseum',
    path: '/colosseum.jpg'
  }
} as const;

// Trip type mapping for display
export const tripTypeLabels = {
  'city-break': 'City Break',
  'mountain': 'Mountain',
  'exotic': 'Exotic',
  'last-minute': 'Last Minute',
  'family': 'Family',
  'trekking': 'Trekking',
  'cultural': 'Cultural'
} as const;

export type TripType = keyof typeof tripTypeLabels;
export type PictureKey = keyof typeof availablePictures;

// Picture selection context
export const PictureSelectionContext = {
  ADD: 'add',
  EDIT: 'edit'
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  MOBILE: 1000
} as const;

// User roles
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout'
  },
  TRIPS: {
    GET_ALL: '/trips',
    GET_BY_ID: (id: number) => `/trips/${id}`,
    CREATE: '/trips',
    UPDATE: (id: number) => `/trips/${id}`,
    DELETE: (id: number) => `/trips/${id}`
  },
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (id: number) => `/admin/users/${id}`,
    CHANGE_PASSWORD: (id: number) => `/admin/users/${id}/password`,
    CHANGE_ROLE: (id: number) => `/admin/users/${id}/role`
  }
} as const;
