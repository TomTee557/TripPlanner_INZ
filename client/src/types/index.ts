// User types
export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: 'USER' | 'ADMIN';
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
  userId: number;
  title: string;
  dateFrom: string;
  dateTo: string;
  country: string;
  tripType: string[];
  tags: string[];
  budget: string | null;
  description: string | null;
  image: string | null;
  createdAt: string;
}

export interface CreateTripData {
  title: string;
  dateFrom: string;
  dateTo: string;
  country: string;
  tripType: string[];
  tags: string[];
  budget?: string;
  description?: string;
  image?: string;
}

export interface UpdateTripData extends Partial<CreateTripData> {
  id: string;
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
