export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  globalRole: 'USER' | 'PLATFORM_ADMIN' | 'SUPPORT_ADMIN';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  capacity: number;
  hostId: string;
  category: string;
  status?: 'ACTIVE' | 'CANCELLED';
}

export interface EventRegistration {
  eventId: string;
  userId: string;
  role: 'ATTENDEE' | 'EVENT_ADMIN' | 'EVENT_MODERATOR';
  status: 'JOINED' | 'WAITLISTED' | 'REMOVED' | 'BANNED';
  waitlistPosition: number; // 1-indexed, 0 if status is 'JOINED'
  createdAt: number; // timestamp
}

export interface Group {
  id: string;
  eventId: string;
  name: string;
  createdBy: string;
  status: 'FORMING' | 'ACTIVE' | 'FULL' | 'DISBANDED';
  createdAt: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'MEMBER' | 'GROUP_ADMIN';
  status: 'JOINED' | 'LEFT' | 'REMOVED';
  joinedAt: number;
}

export interface GroupRequest {
  id: string;
  eventId: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED' | 'BLOCKED';
  createdAt: number;
  expiresAt: number;
}

export interface PlanInvite {
  id: string;
  eventId: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired' | 'blocked';
  createdAt: number;
}

export interface Chat {
  id: string;
  type: 'PRIVATE' | 'GROUP' | 'EVENT';
  eventId?: string;
  groupId?: string;
  createdAt: number;
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  role: 'MEMBER' | 'CHAT_ADMIN';
  status: 'ACTIVE' | 'LEFT' | 'REMOVED';
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  message: string;
  createdAt: number;
}

// Navigation Screens
export type ScreenName = 'Feed' | 'EventDetail' | 'AttendeeList' | 'Inbox';

export interface RouteParams {
  eventId?: string;
}

export interface NavigationState {
  currentScreen: ScreenName;
  params?: RouteParams;
  history: { screen: ScreenName; params?: RouteParams }[];
}

