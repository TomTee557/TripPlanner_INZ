import api from './api';
import type {
  Expense,
  ExpenseCategory,
  CreateExpenseData,
  UpdateExpenseData,
  ApiSuccessResponse,
} from '../types';

/**
 * Get all expense categories
 */
export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await api.get<ApiSuccessResponse<ExpenseCategory[]>>('/expense-categories');
  return response.data || [];
};

/**
 * Get all expenses for a trip
 */
export const getExpenses = async (tripId: string): Promise<Expense[]> => {
  const response = await api.get<ApiSuccessResponse<Expense[]>>(`/trips/${tripId}/expenses`);
  return response.data || [];
};

/**
 * Get single expense by ID
 */
export const getExpenseById = async (tripId: string, expenseId: string): Promise<Expense> => {
  const response = await api.get<ApiSuccessResponse<Expense>>(`/trips/${tripId}/expenses/${expenseId}`);
  if (!response.data) {
    throw new Error('Expense not found');
  }
  return response.data;
};

/**
 * Create new expense
 */
export const createExpense = async (tripId: string, data: CreateExpenseData): Promise<Expense> => {
  const response = await api.post<ApiSuccessResponse<Expense>>(`/trips/${tripId}/expenses`, data);
  if (!response.data) {
    throw new Error('Failed to create expense');
  }
  return response.data;
};

/**
 * Update expense
 */
export const updateExpense = async (
  tripId: string,
  expenseId: string,
  data: UpdateExpenseData
): Promise<Expense> => {
  const response = await api.put<ApiSuccessResponse<Expense>>(
    `/trips/${tripId}/expenses/${expenseId}`,
    data
  );
  if (!response.data) {
    throw new Error('Failed to update expense');
  }
  return response.data;
};

/**
 * Delete expense
 */
export const deleteExpense = async (tripId: string, expenseId: string): Promise<void> => {
  await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
};

/**
 * Calculate total expenses for a trip
 */
export const calculateTotalExpenses = (expenses: Expense[]): Record<string, number> => {
  const totals: Record<string, number> = {};
  
  expenses.forEach((expense) => {
    const currency = expense.currency;
    if (!totals[currency]) {
      totals[currency] = 0;
    }
    totals[currency] += expense.amount;
  });
  
  return totals;
};
