// Constants for Trip Planner App

// Available pictures for trips
export const availablePictures = {
  'mountains': {
    name: 'Mountains',
    path: '/public/assets/mountains.jpg'
  },
  'mountains-2': {
    name: 'Mountains 2',
    path: '/public/assets/mountains-2.jpg'
  },
  'oriental': {
    name: 'Oriental',
    path: '/public/assets/oriental.jpg'
  },
  'eiffel-tower': {
    name: 'Eiffel Tower',
    path: '/public/assets/eiffel-tower.jpg'
  },
  'mountain-3': {
    name: 'Mountains 3',
    path: '/public/assets/mountains-3.jpg'
  },
  'colosseum': {
    name: 'Colosseum',
    path: '/public/assets/colosseum.jpg'
  }
};

// Trip type mapping for display
export const tripTypeLabels = {
  'city-break': 'City Break',
  'mountain': 'Mountain',
  'exotic': 'Exotic',
  'last-minute': 'Last Minute',
  'family': 'Family',
  'trekking': 'Trekking',
  'cultural': 'Cultural'
};

// Picture selection context enum
export const PictureSelectionContext = {
  ADD: 'add',
  EDIT: 'edit'
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  MOBILE: 1000
};

// Session management
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// User roles enum
export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

// Default role for new users
export const DEFAULT_USER_ROLE = UserRole.USER;
