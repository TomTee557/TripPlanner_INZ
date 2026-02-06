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

// Expense types
export interface ExpenseCategory {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  tripId: string;
  categoryId: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  currency: string;
  description?: string;
  expenseDate: string;
  createdAt: string;
}

export interface CreateExpenseData {
  categoryId: number;
  amount: number;
  currency?: string;
  description?: string;
  expenseDate: string;
}

export interface UpdateExpenseData {
  categoryId?: number;
  amount?: number;
  currency?: string;
  description?: string;
  expenseDate?: string;
}

// Packing types
export interface PackingCategory {
  id: number;
  name: string;
  icon?: string;
  createdAt: string;
}

export interface PackingItem {
  id: string;
  tripId: string;
  categoryId: number;
  categoryName?: string;
  categoryIcon?: string;
  name: string;
  quantity: number;
  isPacked: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface CreatePackingItemData {
  categoryId: number;
  name: string;
  quantity?: number;
  isPacked?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdatePackingItemData {
  categoryId?: number;
  name?: string;
  quantity?: number;
  isPacked?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

// Todo types
export interface TodoItem {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface CreateTodoItemData {
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoItemData {
  title?: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
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
