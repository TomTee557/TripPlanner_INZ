// User types
export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Trip types
export interface Trip {
  id: string;
  userId?: number;
  title: string;
  dateFrom: string;
  dateTo: string;
  country: string;
  tripType: string | string[];
  tags: string | string[];
  price?: number;
  budget?: string;
  picture: string;
  description: string | null;
  createdAt: string;
  image?: string;
}

export interface CreateTripData {
  title: string;
  dateFrom: string;
  dateTo: string;
  country: string;
  tripType: string;
  tags?: string;
  price: number;
  picture: string;
  description?: string;
}

export interface UpdateTripData {
  id: string;
  title?: string;
  dateFrom?: string;
  dateTo?: string;
  country?: string;
  tripType?: string;
  tags?: string;
  price?: number;
  picture?: string;
  description?: string;
}

export interface TripFilters {
  title?: string;
  country?: string;
  tripTypes?: string[];
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
}

// API Response types
export interface ApiError {
  error: string;
  message: string;
}

export interface ApiSuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
