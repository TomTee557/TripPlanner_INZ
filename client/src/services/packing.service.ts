import api from './api';
import type {
  PackingItem,
  PackingCategory,
  CreatePackingItemData,
  UpdatePackingItemData,
  ApiSuccessResponse,
} from '../types';

/**
 * Get all packing categories
 */
export const getPackingCategories = async (): Promise<PackingCategory[]> => {
  const response = await api.get<ApiSuccessResponse<PackingCategory[]>>('/packing-categories');
  return response.data || [];
};

/**
 * Get all packing items for a trip
 */
export const getPackingItems = async (tripId: string): Promise<PackingItem[]> => {
  const response = await api.get<ApiSuccessResponse<PackingItem[]>>(`/trips/${tripId}/packing`);
  return response.data || [];
};

/**
 * Create new packing item
 */
export const createPackingItem = async (
  tripId: string,
  data: CreatePackingItemData
): Promise<PackingItem> => {
  const response = await api.post<ApiSuccessResponse<PackingItem>>(`/trips/${tripId}/packing`, data);
  if (!response.data) {
    throw new Error('Failed to create packing item');
  }
  return response.data;
};

/**
 * Update packing item
 */
export const updatePackingItem = async (
  tripId: string,
  itemId: string,
  data: UpdatePackingItemData
): Promise<PackingItem> => {
  const response = await api.put<ApiSuccessResponse<PackingItem>>(
    `/trips/${tripId}/packing/${itemId}`,
    data
  );
  if (!response.data) {
    throw new Error('Failed to update packing item');
  }
  return response.data;
};

/**
 * Toggle packed status
 */
export const togglePackedStatus = async (
  tripId: string,
  itemId: string,
  isPacked: boolean
): Promise<PackingItem> => {
  return updatePackingItem(tripId, itemId, { isPacked });
};

/**
 * Delete packing item
 */
export const deletePackingItem = async (tripId: string, itemId: string): Promise<void> => {
  await api.delete(`/trips/${tripId}/packing/${itemId}`);
};

/**
 * Calculate packing progress
 */
export const calculatePackingProgress = (items: PackingItem[]): { packed: number; total: number; percentage: number } => {
  const total = items.length;
  const packed = items.filter((item) => item.isPacked).length;
  const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
  
  return { packed, total, percentage };
};
