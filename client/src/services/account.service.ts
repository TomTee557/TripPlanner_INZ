import api from './api';
import type {
  ApiSuccessResponse,
  UserProfile,
  UserDocument,
  CreateDocumentData,
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

export const deleteDocument = (id: string) =>
  api.delete<ApiSuccessResponse>(`/documents/${id}`);

// Invitations
export const getInvitations = () =>
  api.get<ApiSuccessResponse<InvitationsData>>('/invitations');

export const acceptInvitation = (id: string) =>
  api.put<ApiSuccessResponse>(`/invitations/${id}/accept`);

export const declineInvitation = (id: string) =>
  api.put<ApiSuccessResponse>(`/invitations/${id}/decline`);

export const confirmInvitation = (id: string) =>
  api.put<ApiSuccessResponse>(`/invitations/${id}/confirm`);

export const getNotificationCount = () =>
  api.get<ApiSuccessResponse<NotificationCount>>('/invitations/notifications');
