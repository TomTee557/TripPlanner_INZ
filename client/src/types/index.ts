// User types
export type UserPermission = 'SMART_PACKING';

export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  permissions: UserPermission[];
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
  nationality?: string;
  birthday?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Trip types
export interface TripParticipant {
  id: string;
  userId: number;
  email: string;
  name: string;
  surname: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'LEFT';
}

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
  isOwner?: boolean;
  owner?: {
    id: number;
    email: string;
    name: string;
    surname: string;
  } | null;
  participants?: TripParticipant[];
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
  participants?: number[];
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

export type ArchiveFilter = 'archive_only' | 'no_archive' | undefined;

export type GroupFilter = 'group_only' | 'owner_only' | 'solo_only' | undefined;

export interface TripFilters {
  title?: string;
  country?: string;
  tripTypes?: string[];
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  groupFilter?: GroupFilter;
  archiveFilter?: ArchiveFilter;
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
  isPrivate: boolean;
  createdAt: string;
  addedBy?: AddedByUser | null;
}

export interface CreateExpenseData {
  categoryId: number;
  amount: number;
  currency?: string;
  description?: string;
  expenseDate: string;
  isPrivate?: boolean;
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

export interface AddedByUser {
  id: number;
  email: string;
  name: string;
  surname: string;
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
  isPrivate: boolean;
  createdAt: string;
  addedBy?: AddedByUser | null;
}

export interface CreatePackingItemData {
  categoryId: number;
  name: string;
  quantity?: number;
  isPacked?: boolean;
  priority?: 'low' | 'medium' | 'high';
  isPrivate?: boolean;
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
  isPrivate: boolean;
  createdAt: string;
  addedBy?: AddedByUser | null;
}

export interface CreateTodoItemData {
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
  isPrivate?: boolean;
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

// ─── Smart Pack / AI types ──────────────────────────────────────────────────

export interface SmartPackFormSnapshot {
  title: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  price: string;
  budgetCurrency: string;
  tripType: string;
  picture: string;
  description: string;
  tags: string;
  participantIds?: number[];
}

export interface SmartPackContext {
  activities: string[];
  customActivity: string;
  city: string;
  accommodation: string;
  transportToDestination: string[];
  transportAround: string[];
  groupSize: number;
  specialNeeds: string;
}

export interface SmartPackAiPackingItem {
  name: string;
  category: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
}

export interface SmartPackAiTodoItem {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface SmartPackAiExpenseItem {
  description: string;
  categoryName: string;
  amount: number;
  currency: string;
  expenseDate: string;
}

export interface SmartPackAiResponse {
  packingItems: SmartPackAiPackingItem[];
  todoItems: SmartPackAiTodoItem[];
  expenses: SmartPackAiExpenseItem[];
  note: string;
}

// Profile types
export interface UserProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: 'USER' | 'ADMIN';
  birthday: string | null;
  nationality: string | null;
  createdAt: string;
}

// Document types
export interface UserDocument {
  id: string;
  documentType: string;
  description: string | null;
  expirationDate: string;
  createdAt: string;
}

export interface CreateDocumentData {
  documentType: string;
  description?: string;
  expirationDate: string;
}

export interface UpdateDocumentData {
  documentType: string;
  description?: string;
  expirationDate: string;
}

export interface DocumentsExpiringSoon {
  hasExpiring: boolean;
}

// Invitation types
export interface ReceivedInvitation {
  id: string;
  type: 'received';
  tripId: string;
  tripTitle: string;
  tripCountry: string;
  tripDateFrom: string;
  tripDateTo: string;
  invitedBy: {
    id: number;
    email: string;
    name: string;
    surname: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  ownerSeen: boolean;
  createdAt: string;
}

export interface SentInvitation {
  id: string;
  type: 'sent';
  tripId: string;
  tripTitle: string;
  participant: {
    id: number;
    email: string;
    name: string;
    surname: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  ownerSeen: boolean;
  createdAt: string;
}

export interface ConfirmationInvitation {
  id: string;
  type: 'confirmation';
  tripId: string;
  tripTitle: string;
  participant: {
    id: number;
    email: string;
    name: string;
    surname: string;
  };
  status: 'ACCEPTED' | 'REJECTED';
  ownerSeen: boolean;
  createdAt: string;
}

export interface TripMessage {
  id: string;
  source: 'participant' | 'notification';
  type: 'ACCEPTED' | 'REJECTED' | 'LEFT' | 'TRIP_DELETED' | 'TRIP_COMMENT';
  tripTitle: string;
  detail: string;
  seen: boolean;
  createdAt: string;
}

export interface TripComment {
  id: string;
  tripId: string;
  message: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
}

export interface InvitationsData {
  received: ReceivedInvitation[];
  sent: SentInvitation[];
  confirmations: ConfirmationInvitation[];
  messages: TripMessage[];
}

export interface NotificationCount {
  pendingReceived: number;
  unseenResponses: number;
  unseenNotifications: number;
  total: number;
}
