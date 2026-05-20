export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
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
}

export interface EventRegistration {
  eventId: string;
  userId: string;
  status: 'going' | 'waitlisted';
  waitlistPosition: number; // 1-indexed, 0 if status is 'going'
  createdAt: number; // timestamp
}

export interface PlanInvite {
  id: string;
  eventId: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number; // timestamp
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
