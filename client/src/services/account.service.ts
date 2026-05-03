import api from './api';
import type {
  ApiSuccessResponse,
  UserProfile,
  UserDocument,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentsExpiringSoon,
  InvitationsData,
  NotificationCount
} from '@types';

// Profile
export const getProfile = () =>
  api.get<ApiSuccessResponse<UserProfile>>('/profile');

export const updateProfile = (data: { birthday: string | null }) =>
  api.put<ApiSuccessResponse>('/profile', data);

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.put<ApiSuccessResponse>('/profile/password', data);

// Documents
export const getDocuments = () =>
  api.get<ApiSuccessResponse<UserDocument[]>>('/documents');

export const createDocument = (data: CreateDocumentData) =>
  api.post<ApiSuccessResponse<UserDocument>>('/documents', data);

export const updateDocument = (id: string, data: UpdateDocumentData) =>
  api.put<ApiSuccessResponse<UserDocument>>(`/documents/${id}`, data);

export const deleteDocument = (id: string) =>
  api.delete<ApiSuccessResponse>(`/documents/${id}`);

export const getExpiringSoon = () =>
  api.get<ApiSuccessResponse<DocumentsExpiringSoon>>('/documents/expiring-soon');

// Invitations
export const getInvitations = () =>
  api.get<ApiSuccessResponse<InvitationsData>>('/invitations');

export const acceptInvitation = (id: string) =>
  api.put<ApiSuccessResponse>(`/invitations/${id}/accept`);

export const declineInvitation = (id: string) =>
  api.put<ApiSuccessResponse>(`/invitations/${id}/decline`);

export const confirmInvitation = (id: string) =>
  api.put<ApiSuccessResponse>(`/invitations/${id}/confirm`);

export const markNotificationRead = (id: string) =>
  api.put<ApiSuccessResponse>(`/notifications/${id}/mark-read`);

export const clearReadInvitations = () =>
  api.delete<ApiSuccessResponse>('/invitations/clear-read');

export const getNotificationCount = () =>
  api.get<ApiSuccessResponse<NotificationCount>>('/invitations/notifications');
