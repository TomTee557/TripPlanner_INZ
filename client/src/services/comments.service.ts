import api from './api';
import type { ApiSuccessResponse, TripComment } from '@types';

export const getComments = (tripId: string) =>
  api.get<ApiSuccessResponse<TripComment[]>>(`/trips/${tripId}/comments`);

export const addComment = (tripId: string, message: string) =>
  api.post<ApiSuccessResponse<TripComment>>(`/trips/${tripId}/comments`, { message });

export const deleteComment = (tripId: string, commentId: string) =>
  api.delete<ApiSuccessResponse>(`/trips/${tripId}/comments/${commentId}`);
