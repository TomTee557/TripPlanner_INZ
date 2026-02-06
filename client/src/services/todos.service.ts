import api from './api';
import type {
  TodoItem,
  CreateTodoItemData,
  UpdateTodoItemData,
  ApiSuccessResponse,
} from '../types';

/**
 * Get all todo items for a trip
 */
export const getTodoItems = async (tripId: string): Promise<TodoItem[]> => {
  const response = await api.get<ApiSuccessResponse<TodoItem[]>>(`/trips/${tripId}/todos`);
  return response.data || [];
};

/**
 * Create new todo item
 */
export const createTodoItem = async (
  tripId: string,
  data: CreateTodoItemData
): Promise<TodoItem> => {
  const response = await api.post<ApiSuccessResponse<TodoItem>>(`/trips/${tripId}/todos`, data);
  if (!response.data) {
    throw new Error('Failed to create todo item');
  }
  return response.data;
};

/**
 * Update todo item
 */
export const updateTodoItem = async (
  tripId: string,
  itemId: string,
  data: UpdateTodoItemData
): Promise<TodoItem> => {
  const response = await api.put<ApiSuccessResponse<TodoItem>>(
    `/trips/${tripId}/todos/${itemId}`,
    data
  );
  if (!response.data) {
    throw new Error('Failed to update todo item');
  }
  return response.data;
};

/**
 * Toggle completed status
 */
export const toggleCompletedStatus = async (
  tripId: string,
  itemId: string,
  isCompleted: boolean
): Promise<TodoItem> => {
  return updateTodoItem(tripId, itemId, { isCompleted });
};

/**
 * Delete todo item
 */
export const deleteTodoItem = async (tripId: string, itemId: string): Promise<void> => {
  await api.delete(`/trips/${tripId}/todos/${itemId}`);
};

/**
 * Calculate todo progress
 */
export const calculateTodoProgress = (items: TodoItem[]): { completed: number; total: number; percentage: number } => {
  const total = items.length;
  const completed = items.filter((item) => item.isCompleted).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
};

/**
 * Get overdue todos
 */
export const getOverdueTodos = (items: TodoItem[]): TodoItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return items.filter((item) => {
    if (!item.dueDate || item.isCompleted) return false;
    const dueDate = new Date(item.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });
};
