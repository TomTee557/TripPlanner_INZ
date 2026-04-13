import { Request } from 'express';

/**
 * Extended Express Request with authenticated user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
  body: any;
  params: any;
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request body
 */
export interface RegisterRequest {
  email: string;
  name: string;
  surname: string;
  password: string;
}

/**
 * Create/Update trip request body
 */
export interface TripRequest {
  title: string;
  country: string;
  dateFrom: string; // ISO date string
  dateTo: string; // ISO date string
  tripType?: string[];
  tags?: string[];
  budget?: string;
  description?: string;
  image?: string;
}

/**
 * Update user role request body
 */
export interface UpdateUserRoleRequest {
  role: 'USER' | 'ADMIN';
}

/**
 * Update user password request body
 */
export interface UpdateUserPasswordRequest {
  password: string;
}

/**
 * Expense request body
 */
export interface ExpenseRequest {
  categoryId: number;
  amount: number;
  currency?: string;
  description?: string;
  expenseDate: string; // ISO date string
  isPrivate?: boolean;
}

/**
 * Packing item request body
 */
export interface PackingItemRequest {
  categoryId: number;
  name: string;
  quantity?: number;
  isPacked?: boolean;
  priority?: 'low' | 'medium' | 'high';
  isPrivate?: boolean;
}

/**
 * Todo item request body
 */
export interface TodoItemRequest {
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
  isPrivate?: boolean;
}

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success?: false;
  error: string;
  message: string;
  details?: any;
}
