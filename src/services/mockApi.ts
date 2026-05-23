import { User, Event, EventRegistration, PlanInvite, Group, GroupMember, GroupRequest, Chat, ChatMember, Message } from '../types';

// Banned users registry
export let bannedUserIds: string[] = [];

// Mock Users Database
export const MOCK_USERS: User[] = [
  {
    id: 'user_alice',
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    globalRole: 'PLATFORM_ADMIN',
  },
  {
    id: 'user_bob',
    name: 'Bob Johnson',
    email: 'bob.j@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    globalRole: 'USER',
  },
  {
    id: 'user_charlie',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    globalRole: 'USER',
  },
  {
    id: 'user_diana',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    globalRole: 'SUPPORT_ADMIN',
  },
  {
    id: 'user_evan',
    name: 'Evan Wright',
    email: 'evan.w@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    globalRole: 'USER',
  },
  {
    id: 'user_fiona',
    name: 'Fiona Gallagher (Long Name Example for Truncation Support)',
    email: 'fiona.g@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    globalRole: 'USER',
  }
];

// Mock Events Database
export const MOCK_EVENTS: Event[] = [
  {
    id: 'event_jazz',
    title: 'Sunset Rooftop Jazz',
    description: 'An intimate evening of live jazz performance on the gorgeous downtown skyline rooftop. Experience award-winning musicians, artisan cocktails, and unparalleled city views as the sun goes down.',
    date: 'Thursday, May 28, 2026',
    time: '6:30 PM - 9:30 PM',
    location: 'Skyline Lounge, 5th Ave',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    capacity: 2, // Low capacity to test waitlist & auto-promotion easily!
    hostId: 'user_bob',
    category: 'Music',
    status: 'ACTIVE'
  },
  {
    id: 'event_cinema',
    title: 'Starlight Outdoor Cinema',
    description: 'Join us under the stars for a special screening of classic cinema. We provide comfortable bean bags, gourmet popcorn, and a giant high-definition screen. Bring a light jacket or blanket!',
    date: 'Saturday, May 30, 2026',
    time: '8:00 PM - 11:00 PM',
    location: 'Central Park East Lawn',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    capacity: 1, // Ultra-low capacity to test immediate waitlisting!
    hostId: 'user_diana',
    category: 'Entertainment',
    status: 'ACTIVE'
  },
  {
    id: 'event_ai',
    title: 'DeepMind AI Hackathon',
    description: 'Collaborate and build cutting-edge artificial intelligence agents to solve real-world problems. Mentors from DeepMind will be on-site. Exciting prizes for top teams, food, and swag included.',
    date: 'June 5-7, 2026',
    time: '9:00 AM Friday - 6:00 PM Sunday',
    location: 'Google Developer Space, London',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    capacity: 10,
    hostId: 'user_alice',
    category: 'Technology',
    status: 'ACTIVE'
  },
  {
    id: 'event_yoga',
    title: 'Mindfulness & Vinyasa Yoga',
    description: 'Align your mind, body, and breath in this restorative sunset yoga flow. Guided by certified instructor Fiona, this session concludes with a 15-minute sound bath meditation. Suitable for all skill levels.',
    date: 'Tuesday, June 2, 2026',
    time: '5:30 PM - 7:00 PM',
    location: 'Zen Garden Studio B',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    capacity: 4,
    hostId: 'user_fiona',
    category: 'Wellness',
    status: 'ACTIVE'
  },
  {
    id: 'event_design',
    title: 'Product Design Interactive Workshop',
    description: 'An interactive hands-on workshop focused on UX research, rapid wireframing, and Figma prototyping. Learn the workflows that professional product designers use to ship premium interfaces.',
    date: 'Wednesday, June 10, 2026',
    time: '1:00 PM - 4:00 PM',
    location: 'Design Lab Commons',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800',
    capacity: 5,
    hostId: 'user_evan',
    category: 'Design',
    status: 'ACTIVE'
  }
];

// Seed In-Memory Database States
export let registrations: EventRegistration[] = [
  // Sunset Rooftop Jazz: 2 Joined (Bob - Host/Admin, Charlie - Attendee)
  { eventId: 'event_jazz', userId: 'user_bob', role: 'EVENT_ADMIN', status: 'JOINED', waitlistPosition: 0, createdAt: Date.now() - 3600000 * 2 },
  { eventId: 'event_jazz', userId: 'user_charlie', role: 'ATTENDEE', status: 'JOINED', waitlistPosition: 0, createdAt: Date.now() - 3600000 },

  // Starlight Cinema: 1 Joined (Diana - Host/Admin), 1 Waitlisted (Bob - Attendee)
  { eventId: 'event_cinema', userId: 'user_diana', role: 'EVENT_ADMIN', status: 'JOINED', waitlistPosition: 0, createdAt: Date.now() - 3600000 * 3 },
  { eventId: 'event_cinema', userId: 'user_bob', role: 'ATTENDEE', status: 'WAITLISTED', waitlistPosition: 1, createdAt: Date.now() - 3600000 * 2 },

  // DeepMind Hackathon: 2 Joined (Alice - Host/Admin, Diana - Attendee)
  { eventId: 'event_ai', userId: 'user_alice', role: 'EVENT_ADMIN', status: 'JOINED', waitlistPosition: 0, createdAt: Date.now() - 3600000 * 2 },
  { eventId: 'event_ai', userId: 'user_diana', role: 'ATTENDEE', status: 'JOINED', waitlistPosition: 0, createdAt: Date.now() - 3600000 },
];

export let invites: PlanInvite[] = [
  // Seeded invites from Bob to Alice
  {
    id: 'invite_1',
    eventId: 'event_jazz',
    senderId: 'user_bob',
    receiverId: 'user_alice',
    status: 'pending',
    createdAt: Date.now() - 1800000
  },
  // Seeded invites from Diana to Alice
  {
    id: 'invite_2',
    eventId: 'event_cinema',
    senderId: 'user_diana',
    receiverId: 'user_alice',
    status: 'pending',
    createdAt: Date.now() - 900000
  }
];

// Context database tables
export let groups: Group[] = [
  {
    id: 'group_jazz_1',
    eventId: 'event_jazz',
    name: 'Jazz Lounge VIPs',
    createdBy: 'user_charlie',
    status: 'ACTIVE',
    createdAt: Date.now() - 3600000 * 24
  }
];

export let group_members: GroupMember[] = [
  {
    id: 'gm_1',
    groupId: 'group_jazz_1',
    userId: 'user_charlie',
    role: 'GROUP_ADMIN',
    status: 'JOINED',
    joinedAt: Date.now() - 3600000 * 24
  },
  {
    id: 'gm_2',
    groupId: 'group_jazz_1',
    userId: 'user_bob',
    role: 'MEMBER',
    status: 'JOINED',
    joinedAt: Date.now() - 3600000 * 23
  }
];

export let group_requests: GroupRequest[] = [];

export let chats: Chat[] = [
  // Event Chats (Pre-created for active events)
  { id: 'chat_ev_jazz', type: 'EVENT', eventId: 'event_jazz', createdAt: Date.now() - 3600000 * 48 },
  { id: 'chat_ev_cinema', type: 'EVENT', eventId: 'event_cinema', createdAt: Date.now() - 3600000 * 48 },
  { id: 'chat_ev_ai', type: 'EVENT', eventId: 'event_ai', createdAt: Date.now() - 3600000 * 48 },
  { id: 'chat_ev_yoga', type: 'EVENT', eventId: 'event_yoga', createdAt: Date.now() - 3600000 * 48 },
  { id: 'chat_ev_design', type: 'EVENT', eventId: 'event_design', createdAt: Date.now() - 3600000 * 48 },

  // Group Chats
  { id: 'chat_gr_jazz_1', type: 'GROUP', groupId: 'group_jazz_1', createdAt: Date.now() - 3600000 * 24 }
];

export let chat_members: ChatMember[] = [
  // Event Jazz Chat Members
  { id: 'cm_ev_j_1', chatId: 'chat_ev_jazz', userId: 'user_bob', role: 'CHAT_ADMIN', status: 'ACTIVE' },
  { id: 'cm_ev_j_2', chatId: 'chat_ev_jazz', userId: 'user_charlie', role: 'MEMBER', status: 'ACTIVE' },

  // Event Cinema Chat Members
  { id: 'cm_ev_c_1', chatId: 'chat_ev_cinema', userId: 'user_diana', role: 'CHAT_ADMIN', status: 'ACTIVE' },

  // Event AI Chat Members
  { id: 'cm_ev_a_1', chatId: 'chat_ev_ai', userId: 'user_alice', role: 'CHAT_ADMIN', status: 'ACTIVE' },
  { id: 'cm_ev_a_2', chatId: 'chat_ev_ai', userId: 'user_diana', role: 'MEMBER', status: 'ACTIVE' },

  // Group Jazz Chat Members
  { id: 'cm_gr_j_1', chatId: 'chat_gr_jazz_1', userId: 'user_charlie', role: 'CHAT_ADMIN', status: 'ACTIVE' },
  { id: 'cm_gr_j_2', chatId: 'chat_gr_jazz_1', userId: 'user_bob', role: 'MEMBER', status: 'ACTIVE' }
];

export let messages: Message[] = [
  { id: 'msg_ev_j_1', chatId: 'chat_ev_jazz', senderId: 'user_bob', message: 'Welcome to Sunset Rooftop Jazz! Looking forward to seeing everyone.', createdAt: Date.now() - 3600000 * 2 },
  { id: 'msg_ev_j_2', chatId: 'chat_ev_jazz', senderId: 'user_charlie', message: 'Thanks Bob! Stoked for the cocktails too.', createdAt: Date.now() - 3600000 },

  { id: 'msg_gr_j_1', chatId: 'chat_gr_jazz_1', senderId: 'user_charlie', message: 'Hey Bob, created this group so we can plan carpooling.', createdAt: Date.now() - 3600000 * 23 },
  { id: 'msg_gr_j_2', chatId: 'chat_gr_jazz_1', senderId: 'user_bob', message: 'Awesome idea. I can drive if we need to.', createdAt: Date.now() - 3600000 * 22 }
];

// Error simulator control
let simulateErrorOnce = false;

export const setSimulateErrorOnce = (val: boolean) => {
  simulateErrorOnce = val;
};

// Latency Simulation Helper
const simulateNetwork = <T>(fn: () => T): Promise<T> => {
  const latency = Math.floor(Math.random() * (1200 - 300 + 1)) + 300; // 300ms to 1200ms
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateErrorOnce) {
        simulateErrorOnce = false;
        reject(new Error('Network error. Please try again.'));
      } else {
        try {
          resolve(fn());
        } catch (err) {
          reject(err);
        }
      }
    }, latency);
  });
};

// Response Type wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ==========================================
// BACKEND PERMISSION CHECKERS (SECURITY LAYER)
// ==========================================

export function isUserBanned(userId: string): boolean {
  return bannedUserIds.includes(userId);
}

export function canEditEvent(userId: string, eventId: string): boolean {
  if (isUserBanned(userId)) return false;
  const user = MOCK_USERS.find(u => u.id === userId);
  if (user?.globalRole === 'PLATFORM_ADMIN') return true;

  const member = registrations.find(r => r.eventId === eventId && r.userId === userId);
  return member?.role === 'EVENT_ADMIN' && member.status === 'JOINED';
}

export function canRemoveAttendee(userId: string, eventId: string, targetUserId: string): boolean {
  if (isUserBanned(userId)) return false;
  const user = MOCK_USERS.find(u => u.id === userId);
  if (user?.globalRole === 'PLATFORM_ADMIN') return true;

  const member = registrations.find(r => r.eventId === eventId && r.userId === userId);
  if (!member || member.status !== 'JOINED') return false;

  // EVENT_ADMIN can remove attendees or moderators. EVENT_MODERATOR can only remove attendees.
  if (member.role === 'EVENT_ADMIN') return true;
  if (member.role === 'EVENT_MODERATOR') {
    const targetMember = registrations.find(r => r.eventId === eventId && r.userId === targetUserId);
    return targetMember?.role === 'ATTENDEE';
  }
  return false;
}

export function canRenameGroup(userId: string, groupId: string): boolean {
  if (isUserBanned(userId)) return false;
  const user = MOCK_USERS.find(u => u.id === userId);
  if (user?.globalRole === 'PLATFORM_ADMIN') return true;

  const groupMember = group_members.find(gm => gm.groupId === groupId && gm.userId === userId);
  return groupMember?.role === 'GROUP_ADMIN' && groupMember.status === 'JOINED';
}

export function canRemoveGroupMember(userId: string, groupId: string, targetUserId: string): boolean {
  if (isUserBanned(userId)) return false;
  const user = MOCK_USERS.find(u => u.id === userId);
  if (user?.globalRole === 'PLATFORM_ADMIN') return true;

  const groupMember = group_members.find(gm => gm.groupId === groupId && gm.userId === userId);
  return groupMember?.role === 'GROUP_ADMIN' && groupMember.status === 'JOINED';
}

export function canDeleteMessage(userId: string, messageId: string): boolean {
  if (isUserBanned(userId)) return false;
  const user = MOCK_USERS.find(u => u.id === userId);
  if (user?.globalRole === 'PLATFORM_ADMIN') return true;

  const message = messages.find(m => m.id === messageId);
  if (!message) return false;

  // Sender can delete own message
  if (message.senderId === userId) return true;

  // CHAT_ADMIN of this chat can delete messages
  const chatMember = chat_members.find(cm => cm.chatId === message.chatId && cm.userId === userId);
  return chatMember?.role === 'CHAT_ADMIN' && chatMember.status === 'ACTIVE';
}

export function canBanUser(userId: string): boolean {
  const user = MOCK_USERS.find(u => u.id === userId);
  return user?.globalRole === 'PLATFORM_ADMIN';
}

// Service Layer Interface
export const mockApi = {
  /**
   * Fetch all events with status for the current active user
   */
  fetchEvents: (currentUserId: string): Promise<ApiResponse<any[]>> => {
    return simulateNetwork(() => {
      const activeEvents = MOCK_EVENTS.filter(e => e.status !== 'CANCELLED');
      const eventsWithMetadata = activeEvents.map(event => {
        const eventRegs = registrations.filter(r => r.eventId === event.id);
        const goingCount = eventRegs.filter(r => r.status === 'JOINED').length;
        const waitlistedCount = eventRegs.filter(r => r.status === 'WAITLISTED').length;

        const userReg = eventRegs.find(r => r.userId === currentUserId);

        let rsvpStatus: 'going' | 'waitlisted' | 'none' = 'none';
        if (userReg) {
          if (userReg.status === 'JOINED') rsvpStatus = 'going';
          else if (userReg.status === 'WAITLISTED') rsvpStatus = 'waitlisted';
        }

        return {
          ...event,
          goingCount,
          waitlistedCount,
          rsvpStatus,
          waitlistPosition: userReg ? userReg.waitlistPosition : 0,
        };
      });
      return { data: eventsWithMetadata, error: null };
    });
  },

  /**
   * Fetch a single event with complete details and attendee list
   */
  fetchEvent: (eventId: string, currentUserId: string): Promise<ApiResponse<any>> => {
    return simulateNetwork(() => {
      const event = MOCK_EVENTS.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const eventRegs = registrations.filter(r => r.eventId === eventId);
      const goingCount = eventRegs.filter(r => r.status === 'JOINED').length;
      const waitlistedCount = eventRegs.filter(r => r.status === 'WAITLISTED').length;

      // Extract attendee details (joined users) and attach roles
      const attendees = eventRegs
        .filter(r => r.status === 'JOINED')
        .map(r => {
          const user = MOCK_USERS.find(u => u.id === r.userId);
          if (!user) return null;
          return {
            ...user,
            eventRole: r.role,
            eventStatus: r.status,
          };
        })
        .filter((u): u is any => !!u);

      const userReg = eventRegs.find(r => r.userId === currentUserId);

      let rsvpStatus: 'going' | 'waitlisted' | 'none' = 'none';
      if (userReg) {
        if (userReg.status === 'JOINED') rsvpStatus = 'going';
        else if (userReg.status === 'WAITLISTED') rsvpStatus = 'waitlisted';
      }

      // Fetch event groups
      const eventGroups = groups.filter(g => g.eventId === eventId && g.status !== 'DISBANDED');

      return {
        data: {
          ...event,
          goingCount,
          waitlistedCount,
          rsvpStatus,
          waitlistPosition: userReg ? userReg.waitlistPosition : 0,
          attendees,
          groups: eventGroups,
          userRole: userReg ? userReg.role : 'ATTENDEE',
        },
        error: null,
      };
    });
  },

  /**
   * RSVP to an event
   */
  rsvp: (eventId: string, userId: string): Promise<ApiResponse<{ registration: EventRegistration; promotedUser?: string }>> => {
    return simulateNetwork(() => {
      if (isUserBanned(userId)) {
        throw new Error('You are banned from the platform.');
      }

      const event = MOCK_EVENTS.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');
      if (event.status === 'CANCELLED') throw new Error('Cannot RSVP: Event is cancelled.');

      // Check if already registered
      const existingIndex = registrations.findIndex(r => r.eventId === eventId && r.userId === userId);
      if (existingIndex !== -1) {
        const existing = registrations[existingIndex];
        if (existing.status === 'BANNED') throw new Error('You are banned from this event.');
        if (existing.status === 'JOINED' || existing.status === 'WAITLISTED') {
          return { data: { registration: existing }, error: null };
        }
        // If they were previously removed, let them re-join
        registrations.splice(existingIndex, 1);
      }

      const eventRegs = registrations.filter(r => r.eventId === eventId);
      const goingCount = eventRegs.filter(r => r.status === 'JOINED').length;

      let registration: EventRegistration;

      if (goingCount < event.capacity) {
        registration = {
          eventId,
          userId,
          role: 'ATTENDEE',
          status: 'JOINED',
          waitlistPosition: 0,
          createdAt: Date.now()
        };

        // Add to Event Chat
        const eventChat = chats.find(c => c.eventId === eventId && c.type === 'EVENT');
        if (eventChat) {
          const chatMemberExists = chat_members.some(cm => cm.chatId === eventChat.id && cm.userId === userId);
          if (!chatMemberExists) {
            chat_members.push({
              id: `cm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              chatId: eventChat.id,
              userId,
              role: 'MEMBER',
              status: 'ACTIVE'
            });
          } else {
            // Restore active state
            const cm = chat_members.find(cm => cm.chatId === eventChat.id && cm.userId === userId);
            if (cm) cm.status = 'ACTIVE';
          }
        }
      } else {
        const waitlistedCount = eventRegs.filter(r => r.status === 'WAITLISTED').length;
        registration = {
          eventId,
          userId,
          role: 'ATTENDEE',
          status: 'WAITLISTED',
          waitlistPosition: waitlistedCount + 1,
          createdAt: Date.now()
        };
      }

      registrations.push(registration);

      return { data: { registration }, error: null };
    });
  },

  /**
   * Cancel RSVP and trigger auto-promotion
   */
  cancelRsvp: (eventId: string, userId: string): Promise<ApiResponse<{ promotedUser: User | null }>> => {
    return simulateNetwork(() => {
      const index = registrations.findIndex(r => r.eventId === eventId && r.userId === userId);
      if (index === -1) {
        return { data: { promotedUser: null }, error: null };
      }

      const canceledReg = registrations[index];

      // Edge Case 1: Sole admin tries to remove themselves - block it
      if (canceledReg.role === 'EVENT_ADMIN' && canceledReg.status === 'JOINED') {
        const otherAdmins = registrations.filter(r => r.eventId === eventId && r.userId !== userId && r.role === 'EVENT_ADMIN' && r.status === 'JOINED');
        if (otherAdmins.length === 0) {
          // Are there other attendees to transfer to?
          const candidates = registrations.filter(r => r.eventId === eventId && r.userId !== userId && r.status === 'JOINED');
          if (candidates.length > 0) {
            throw new Error('You are the sole Event Admin. Promote another member to Host before leaving.');
          } else {
            // No other members, allow leaving but mark event as cancelled or disband it
            throw new Error('You are the sole host. Please Cancel the Event instead of leaving.');
          }
        }
      }

      // Mark status as REMOVED (keeping record in db to replicate PostgreSQL audit)
      canceledReg.status = 'REMOVED';
      canceledReg.waitlistPosition = 0;

      // Update event chat membership
      const eventChat = chats.find(c => c.eventId === eventId && c.type === 'EVENT');
      if (eventChat) {
        const cm = chat_members.find(m => m.chatId === eventChat.id && m.userId === userId);
        if (cm) cm.status = 'LEFT';
      }

      // Remove from any groups under this event
      const eventGroups = groups.filter(g => g.eventId === eventId);
      eventGroups.forEach(g => {
        const gm = group_members.find(m => m.groupId === g.id && m.userId === userId);
        if (gm && gm.status === 'JOINED') {
          gm.status = 'LEFT';
          const grChat = chats.find(c => c.groupId === g.id);
          if (grChat) {
            const cm = chat_members.find(m => m.chatId === grChat.id && m.userId === userId);
            if (cm) cm.status = 'LEFT';
          }
        }
      });

      let promotedUser: User | null = null;

      if (canceledReg.status === 'REMOVED') {
        // Find waitlisted users for this event
        const waitlist = registrations
          .filter(r => r.eventId === eventId && r.status === 'WAITLISTED')
          .sort((a, b) => a.waitlistPosition - b.waitlistPosition);

        if (waitlist.length > 0) {
          // Promote the first waitlisted user
          const promotedReg = waitlist[0];
          promotedReg.status = 'JOINED';
          promotedReg.waitlistPosition = 0;

          // Add promoted user to Event Chat
          if (eventChat) {
            const chatMemberExists = chat_members.some(cm => cm.chatId === eventChat.id && cm.userId === promotedReg.userId);
            if (!chatMemberExists) {
              chat_members.push({
                id: `cm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                chatId: eventChat.id,
                userId: promotedReg.userId,
                role: 'MEMBER',
                status: 'ACTIVE'
              });
            } else {
              const cm = chat_members.find(cm => cm.chatId === eventChat.id && cm.userId === promotedReg.userId);
              if (cm) cm.status = 'ACTIVE';
            }
          }

          // Find full User model
          promotedUser = MOCK_USERS.find(u => u.id === promotedReg.userId) || null;

          // Shift remaining waitlisted users up
          for (let i = 1; i < waitlist.length; i++) {
            waitlist[i].waitlistPosition = i;
          }
        }
      }

      return { data: { promotedUser }, error: null };
    });
  },

  /**
   * Edit Event details (EVENT_ADMIN or PLATFORM_ADMIN)
   */
  editEvent: (userId: string, eventId: string, updates: Partial<Event>): Promise<ApiResponse<Event>> => {
    return simulateNetwork(() => {
      if (!canEditEvent(userId, eventId)) {
        throw new Error('403 Forbidden: You do not have permission to edit this event.');
      }

      const eventIndex = MOCK_EVENTS.findIndex(e => e.id === eventId);
      if (eventIndex === -1) throw new Error('Event not found');

      const oldCapacity = MOCK_EVENTS[eventIndex].capacity;
      const newCapacity = updates.capacity !== undefined ? updates.capacity : oldCapacity;

      MOCK_EVENTS[eventIndex] = {
        ...MOCK_EVENTS[eventIndex],
        ...updates,
      };

      // Auto-promote waitlisted users if capacity increased
      if (newCapacity > oldCapacity) {
        let spotsAvailable = newCapacity - oldCapacity;
        const waitlist = registrations
          .filter(r => r.eventId === eventId && r.status === 'WAITLISTED')
          .sort((a, b) => a.waitlistPosition - b.waitlistPosition);

        const promotedCount = Math.min(spotsAvailable, waitlist.length);
        const eventChat = chats.find(c => c.eventId === eventId && c.type === 'EVENT');

        for (let i = 0; i < promotedCount; i++) {
          const reg = waitlist[i];
          reg.status = 'JOINED';
          reg.waitlistPosition = 0;

          if (eventChat) {
            const cm = chat_members.find(m => m.chatId === eventChat.id && m.userId === reg.userId);
            if (cm) cm.status = 'ACTIVE';
            else {
              chat_members.push({
                id: `cm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                chatId: eventChat.id,
                userId: reg.userId,
                role: 'MEMBER',
                status: 'ACTIVE'
              });
            }
          }
        }

        // Shift remaining waitlist
        const remainingWaitlist = registrations
          .filter(r => r.eventId === eventId && r.status === 'WAITLISTED')
          .sort((a, b) => a.waitlistPosition - b.waitlistPosition);

        remainingWaitlist.forEach((reg, idx) => {
          reg.waitlistPosition = idx + 1;
        });
      }

      return { data: MOCK_EVENTS[eventIndex], error: null };
    });
  },

  /**
   * Cancel Event (EVENT_ADMIN or PLATFORM_ADMIN)
   */
  cancelEvent: (userId: string, eventId: string): Promise<ApiResponse<boolean>> => {
    return simulateNetwork(() => {
      if (!canEditEvent(userId, eventId)) {
        throw new Error('403 Forbidden: You do not have permission to cancel this event.');
      }

      const event = MOCK_EVENTS.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      event.status = 'CANCELLED';

      // Disband all associated event groups
      const eventGroups = groups.filter(g => g.eventId === eventId);
      eventGroups.forEach(g => {
        g.status = 'DISBANDED';
      });

      return { data: true, error: null };
    });
  },

  /**
   * Remove Attendee (EVENT_ADMIN, EVENT_MODERATOR, or PLATFORM_ADMIN)
   */
  removeAttendee: (userId: string, eventId: string, targetUserId: string): Promise<ApiResponse<boolean>> => {
    return simulateNetwork(() => {
      if (!canRemoveAttendee(userId, eventId, targetUserId)) {
        throw new Error('403 Forbidden: You do not have permission to remove this attendee.');
      }

      const reg = registrations.find(r => r.eventId === eventId && r.userId === targetUserId);
      if (!reg || reg.status !== 'JOINED') {
        throw new Error('Attendee is not currently going to this event.');
      }

      // Block removing sole host/admin
      if (reg.role === 'EVENT_ADMIN') {
        const otherAdmins = registrations.filter(r => r.eventId === eventId && r.userId !== targetUserId && r.role === 'EVENT_ADMIN' && r.status === 'JOINED');
        if (otherAdmins.length === 0) {
          throw new Error('Cannot remove the sole Event Host. Promote another Host first.');
        }
      }

      reg.status = 'REMOVED';

      // Remove from Event Chat
      const eventChat = chats.find(c => c.eventId === eventId && c.type === 'EVENT');
      if (eventChat) {
        const cm = chat_members.find(m => m.chatId === eventChat.id && m.userId === targetUserId);
        if (cm) cm.status = 'REMOVED';
      }

      // Remove from Groups
      const eventGroups = groups.filter(g => g.eventId === eventId);
      eventGroups.forEach(g => {
        const gm = group_members.find(m => m.groupId === g.id && m.userId === targetUserId);
        if (gm) {
          gm.status = 'REMOVED';
          const grChat = chats.find(c => c.groupId === g.id);
          if (grChat) {
            const cm = chat_members.find(m => m.chatId === grChat.id && m.userId === targetUserId);
            if (cm) cm.status = 'REMOVED';
          }
        }
      });

      // Promote waitlisted
      const waitlist = registrations
        .filter(r => r.eventId === eventId && r.status === 'WAITLISTED')
        .sort((a, b) => a.waitlistPosition - b.waitlistPosition);

      if (waitlist.length > 0) {
        const promotedReg = waitlist[0];
        promotedReg.status = 'JOINED';
        promotedReg.waitlistPosition = 0;

        if (eventChat) {
          const cm = chat_members.find(m => m.chatId === eventChat.id && m.userId === promotedReg.userId);
          if (cm) cm.status = 'ACTIVE';
          else {
            chat_members.push({
              id: `cm_${Date.now()}`,
              chatId: eventChat.id,
              userId: promotedReg.userId,
              role: 'MEMBER',
              status: 'ACTIVE'
            });
          }
        }

        // Shift waitlist
        for (let i = 1; i < waitlist.length; i++) {
          waitlist[i].waitlistPosition = i;
        }
      }

      return { data: true, error: null };
    });
  },

  /**
   * Promote or Demote Event Moderator roles
   */
  updateAttendeeRole: (userId: string, eventId: string, targetUserId: string, newRole: 'ATTENDEE' | 'EVENT_MODERATOR' | 'EVENT_ADMIN'): Promise<ApiResponse<boolean>> => {
    return simulateNetwork(() => {
      // Only EVENT_ADMIN or PLATFORM_ADMIN can modify roles
      const user = MOCK_USERS.find(u => u.id === userId);
      const isPlatformAdmin = user?.globalRole === 'PLATFORM_ADMIN';
      const userReg = registrations.find(r => r.eventId === eventId && r.userId === userId);
      const isEventAdmin = userReg?.role === 'EVENT_ADMIN' && userReg.status === 'JOINED';

      if (!isPlatformAdmin && !isEventAdmin) {
        throw new Error('403 Forbidden: Only the Host or Platform Admin can change attendee roles.');
      }

      const targetReg = registrations.find(r => r.eventId === eventId && r.userId === targetUserId);
      if (!targetReg) throw new Error('Attendee not found in event.');

      // Block demoting the last host/admin
      if (targetReg.role === 'EVENT_ADMIN' && newRole !== 'EVENT_ADMIN') {
        const otherAdmins = registrations.filter(r => r.eventId === eventId && r.userId !== targetUserId && r.role === 'EVENT_ADMIN' && r.status === 'JOINED');
        if (otherAdmins.length === 0) {
          throw new Error('Cannot demote the sole Event Host. Promote another Host first.');
        }
      }

      targetReg.role = newRole;
      return { data: true, error: null };
    });
  },

  /**
   * Create Event (Creator becomes EVENT_ADMIN)
   */
  createEvent: (creatorId: string, eventData: Omit<Event, 'id' | 'hostId' | 'status'>): Promise<ApiResponse<Event>> => {
    return simulateNetwork(() => {
      if (isUserBanned(creatorId)) throw new Error('Banned users cannot create events.');

      const newId = `event_${Date.now()}`;
      const newEvent: Event = {
        ...eventData,
        id: newId,
        hostId: creatorId,
        status: 'ACTIVE'
      };

      MOCK_EVENTS.push(newEvent);

      // Add host to event_members
      registrations.push({
        eventId: newId,
        userId: creatorId,
        role: 'EVENT_ADMIN',
        status: 'JOINED',
        waitlistPosition: 0,
        createdAt: Date.now()
      });

      // Create Event Chat and add host as CHAT_ADMIN
      const chatId = `chat_ev_${Date.now()}`;
      chats.push({
        id: chatId,
        type: 'EVENT',
        eventId: newId,
        createdAt: Date.now()
      });

      chat_members.push({
        id: `cm_${Date.now()}`,
        chatId,
        userId: creatorId,
        role: 'CHAT_ADMIN',
        status: 'ACTIVE'
      });

      return { data: newEvent, error: null };
    });
  },

  /**
   * Create a Group (Creator becomes GROUP_ADMIN, creates Chat and adds creator as CHAT_ADMIN)
   */
  createGroup: (userId: string, eventId: string, name: string): Promise<ApiResponse<Group>> => {
    return simulateNetwork(() => {
      if (isUserBanned(userId)) throw new Error('Banned users cannot create groups.');

      // Check if user is in event
      const eventReg = registrations.find(r => r.eventId === eventId && r.userId === userId && r.status === 'JOINED');
      if (!eventReg) {
        throw new Error('You must RSVP and join the event before creating a group.');
      }

      const event = MOCK_EVENTS.find(e => e.id === eventId);
      if (event?.status === 'CANCELLED') throw new Error('Cannot create group. Event is cancelled.');

      const groupId = `group_${Date.now()}`;
      const newGroup: Group = {
        id: groupId,
        eventId,
        name,
        createdBy: userId,
        status: 'ACTIVE',
        createdAt: Date.now()
      };

      groups.push(newGroup);

      // Add creator to group members
      group_members.push({
        id: `gm_${Date.now()}`,
        groupId,
        userId,
        role: 'GROUP_ADMIN',
        status: 'JOINED',
        joinedAt: Date.now()
      });

      // Create group chat
      const chatId = `chat_gr_${Date.now()}`;
      chats.push({
        id: chatId,
        type: 'GROUP',
        groupId,
        createdAt: Date.now()
      });

      // Add creator to chat members as CHAT_ADMIN
      chat_members.push({
        id: `cm_${Date.now()}`,
        chatId,
        userId,
        role: 'CHAT_ADMIN',
        status: 'ACTIVE'
      });

      return { data: newGroup, error: null };
    });
  },

  /**
   * Join a Group
   */
  joinGroup: (userId: string, groupId: string): Promise<ApiResponse<Group>> => {
    return simulateNetwork(() => {
      if (isUserBanned(userId)) throw new Error('Banned users cannot join groups.');

      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');
      if (group.status === 'DISBANDED') throw new Error('Group has been disbanded.');
      if (group.status === 'FULL') throw new Error('Group is full.');

      const event = MOCK_EVENTS.find(e => e.id === group.eventId);
      if (event?.status === 'CANCELLED') throw new Error('Cannot join. Event is cancelled.');

      // Verify RSVP
      const eventReg = registrations.find(r => r.eventId === group.eventId && r.userId === userId && r.status === 'JOINED');
      if (!eventReg) {
        throw new Error('You must be a confirmed attendee of the event to join its groups.');
      }

      // Check if already in group
      const existing = group_members.find(gm => gm.groupId === groupId && gm.userId === userId);
      if (existing) {
        if (existing.status === 'JOINED') {
          return { data: group, error: null };
        }
        existing.status = 'JOINED';
      } else {
        group_members.push({
          id: `gm_${Date.now()}`,
          groupId,
          userId,
          role: 'MEMBER',
          status: 'JOINED',
          joinedAt: Date.now()
        });
      }

      // Add to Group Chat
      const grChat = chats.find(c => c.groupId === groupId);
      if (grChat) {
        const cm = chat_members.find(m => m.chatId === grChat.id && m.userId === userId);
        if (cm) cm.status = 'ACTIVE';
        else {
          chat_members.push({
            id: `cm_${Date.now()}`,
            chatId: grChat.id,
            userId,
            role: 'MEMBER',
            status: 'ACTIVE'
          });
        }
      }

      return { data: group, error: null };
    });
  },

  /**
   * Leave a Group (reassigns admin or disbands)
   */
  leaveGroup: (userId: string, groupId: string): Promise<ApiResponse<boolean>> => {
    return simulateNetwork(() => {
      const gm = group_members.find(m => m.groupId === groupId && m.userId === userId && m.status === 'JOINED');
      if (!gm) throw new Error('You are not in this group.');

      gm.status = 'LEFT';

      // Set chat membership to LEFT
      const grChat = chats.find(c => c.groupId === groupId);
      if (grChat) {
        const cm = chat_members.find(m => m.chatId === grChat.id && m.userId === userId);
        if (cm) cm.status = 'LEFT';
      }

      // If user was GROUP_ADMIN, reassign or disband
      if (gm.role === 'GROUP_ADMIN') {
        const otherMembers = group_members
          .filter(m => m.groupId === groupId && m.userId !== userId && m.status === 'JOINED')
          .sort((a, b) => a.joinedAt - b.joinedAt);

        if (otherMembers.length > 0) {
          // Promote next oldest member
          const nextAdmin = otherMembers[0];
          nextAdmin.role = 'GROUP_ADMIN';

          // Update chat admin role
          if (grChat) {
            const nextChatCm = chat_members.find(m => m.chatId === grChat.id && m.userId === nextAdmin.userId);
            if (nextChatCm) nextChatCm.role = 'CHAT_ADMIN';
          }
        } else {
          // Disband Group
          const gr = groups.find(g => g.id === groupId);
          if (gr) gr.status = 'DISBANDED';
        }
      }

      return { data: true, error: null };
    });
  },

  /**
   * Rename a Group
   */
  renameGroup: (userId: string, groupId: string, newName: string): Promise<ApiResponse<Group>> => {
    return simulateNetwork(() => {
      if (!canRenameGroup(userId, groupId)) {
        throw new Error('403 Forbidden: You do not have permission to rename this group.');
      }

      const gr = groups.find(g => g.id === groupId);
      if (!gr) throw new Error('Group not found');
      if (gr.status === 'DISBANDED') throw new Error('Group is disbanded.');

      gr.name = newName;
      return { data: gr, error: null };
    });
  },

  /**
   * Remove Group Member (GROUP_ADMIN only)
   */
  removeGroupMember: (userId: string, groupId: string, targetUserId: string): Promise<ApiResponse<boolean>> => {
    return simulateNetwork(() => {
      if (!canRemoveGroupMember(userId, groupId, targetUserId)) {
        throw new Error('403 Forbidden: You do not have permission to remove members from this group.');
      }

      const gm = group_members.find(m => m.groupId === groupId && m.userId === targetUserId && m.status === 'JOINED');
      if (!gm) throw new Error('User is not active in this group.');

      gm.status = 'REMOVED';

      // Set chat membership to LEFT
      const grChat = chats.find(c => c.groupId === groupId);
      if (grChat) {
        const cm = chat_members.find(m => m.chatId === grChat.id && m.userId === targetUserId);
        if (cm) cm.status = 'REMOVED';
      }

      return { data: true, error: null };
    });
  },

  /**
   * Ban User (PLATFORM_ADMIN only) - Performs deep platform cleanups
   */
  banUser: (adminId: string, targetUserId: string): Promise<ApiResponse<boolean>> => {
    return simulateNetwork(() => {
      if (!canBanUser(adminId)) {
        throw new Error('403 Forbidden: Only Platform Admins can ban users.');
      }
      if (adminId === targetUserId) {
        throw new Error('You cannot ban yourself.');
      }

      if (!bannedUserIds.includes(targetUserId)) {
        bannedUserIds.push(targetUserId);
      }

      // 1. Kick from all events (sets status to REMOVED/BANNED and triggers auto-promotions)
      const joinedEvents = registrations.filter(r => r.userId === targetUserId && r.status === 'JOINED');
      joinedEvents.forEach(reg => {
        reg.status = 'REMOVED';
        // Auto-promote waitlist
        const waitlist = registrations
          .filter(r => r.eventId === reg.eventId && r.status === 'WAITLISTED')
          .sort((a, b) => a.waitlistPosition - b.waitlistPosition);

        if (waitlist.length > 0) {
          const promotedReg = waitlist[0];
          promotedReg.status = 'JOINED';
          promotedReg.waitlistPosition = 0;

          // Chat promotion
          const eventChat = chats.find(c => c.eventId === reg.eventId && c.type === 'EVENT');
          if (eventChat) {
            const cm = chat_members.find(m => m.chatId === eventChat.id && m.userId === promotedReg.userId);
            if (cm) cm.status = 'ACTIVE';
          }

          // Shift waitlist
          for (let i = 1; i < waitlist.length; i++) {
            waitlist[i].waitlistPosition = i;
          }
        }
      });

      // Update event registrations to banned
      registrations.forEach(r => {
        if (r.userId === targetUserId) {
          r.status = 'BANNED';
        }
      });

      // 2. Remove from all groups
      const targetGroupMemberships = group_members.filter(m => m.userId === targetUserId && m.status === 'JOINED');
      targetGroupMemberships.forEach(gm => {
        gm.status = 'REMOVED';

        // Reassign admin or disband if they were group admin
        if (gm.role === 'GROUP_ADMIN') {
          const otherMembers = group_members
            .filter(m => m.groupId === gm.groupId && m.userId !== targetUserId && m.status === 'JOINED')
            .sort((a, b) => a.joinedAt - b.joinedAt);

          const grChat = chats.find(c => c.groupId === gm.groupId);
          if (otherMembers.length > 0) {
            const nextAdmin = otherMembers[0];
            nextAdmin.role = 'GROUP_ADMIN';
            if (grChat) {
              const cm = chat_members.find(m => m.chatId === grChat.id && m.userId === nextAdmin.userId);
              if (cm) cm.role = 'CHAT_ADMIN';
            }
          } else {
            const gr = groups.find(g => g.id === gm.groupId);
            if (gr) gr.status = 'DISBANDED';
          }
        }
      });

      // 3. Mark all chat memberships as REMOVED
      chat_members.forEach(cm => {
        if (cm.userId === targetUserId) {
          cm.status = 'REMOVED';
        }
      });

      // 4. Cancel pending requests
      invites.forEach(inv => {
        if ((inv.senderId === targetUserId || inv.receiverId === targetUserId) && inv.status === 'pending') {
          inv.status = 'cancelled';
        }
      });

      return { data: true, error: null };
    });
  },

  /**
   * Unban User (PLATFORM_ADMIN only)
   */
  unbanUser: (adminId: string, targetUserId: string): Promise<ApiResponse<boolean>> => {
    return simulateNetwork(() => {
      if (!canBanUser(adminId)) {
        throw new Error('403 Forbidden: Only Platform Admins can unban users.');
      }

      const banIdx = bannedUserIds.indexOf(targetUserId);
      if (banIdx !== -1) {
        bannedUserIds.splice(banIdx, 1);
      }

      // Clean up historical banned state in registrations
      registrations.forEach(r => {
        if (r.userId === targetUserId && r.status === 'BANNED') {
          r.status = 'REMOVED';
        }
      });

      return { data: true, error: null };
    });
  },

  /**
   * Fetch Chats for current user
   */
  fetchChats: (userId: string): Promise<ApiResponse<any[]>> => {
    return simulateNetwork(() => {
      if (isUserBanned(userId)) return { data: [], error: null };

      // Fetch chats where user is an active chat member
      const activeMemberships = chat_members.filter(cm => cm.userId === userId && cm.status === 'ACTIVE');
      const userChats = activeMemberships.map(cm => {
        const chat = chats.find(c => c.id === cm.chatId);
        if (!chat) return null;

        // Fetch details based on chat type
        let title = 'Chat';
        let subtitle = '';
        let icon: string = 'chatbubbles';

        if (chat.type === 'EVENT') {
          const event = MOCK_EVENTS.find(e => e.id === chat.eventId);
          title = event ? event.title : 'Event Chat';
          subtitle = 'Event announcement & discussion';
          icon = 'calendar';
        } else if (chat.type === 'GROUP') {
          const group = groups.find(g => g.id === chat.groupId);
          title = group ? group.name : 'Group Chat';
          subtitle = 'Planning group discussion';
          icon = 'people';
        }

        // Get last message details
        const chatMessages = messages.filter(m => m.chatId === chat.id).sort((a, b) => b.createdAt - a.createdAt);
        const lastMsg = chatMessages[0];
        let lastMessageText = 'No messages yet';
        let lastMessageTime = chat.createdAt;

        if (lastMsg) {
          const sender = MOCK_USERS.find(u => u.id === lastMsg.senderId);
          lastMessageText = sender ? `${sender.name.split(' ')[0]}: ${lastMsg.message}` : lastMsg.message;
          lastMessageTime = lastMsg.createdAt;
        }

        return {
          id: chat.id,
          type: chat.type,
          title,
          subtitle,
          icon,
          lastMessageText,
          lastMessageTime,
          eventId: chat.eventId,
          groupId: chat.groupId,
          role: cm.role,
        };
      }).filter(c => !!c).sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      return { data: userChats, error: null };
    });
  },

  /**
   * Fetch Messages for a specific chat
   */
  fetchMessages: (chatId: string, userId: string): Promise<ApiResponse<any[]>> => {
    return simulateNetwork(() => {
      if (isUserBanned(userId)) throw new Error('Banned from the platform.');

      // Verify chat membership
      const member = chat_members.find(cm => cm.chatId === chatId && cm.userId === userId && cm.status === 'ACTIVE');
      if (!member) {
        throw new Error('You do not have permission to view this chat.');
      }

      const chat = chats.find(c => c.id === chatId);
      if (!chat) throw new Error('Chat not found.');

      // Check if event is cancelled
      let isReadOnly = false;
      if (chat.type === 'EVENT' && chat.eventId) {
        const ev = MOCK_EVENTS.find(e => e.id === chat.eventId);
        if (ev?.status === 'CANCELLED') isReadOnly = true;
      } else if (chat.type === 'GROUP' && chat.groupId) {
        const gr = groups.find(g => g.id === chat.groupId);
        if (gr?.status === 'DISBANDED') isReadOnly = true;
        if (gr) {
          const ev = MOCK_EVENTS.find(e => e.id === gr.eventId);
          if (ev?.status === 'CANCELLED') isReadOnly = true;
        }
      }

      // Fetch group members details if Group Chat
      let membersDetails: any[] = [];
      if (chat.type === 'GROUP' && chat.groupId) {
        membersDetails = group_members
          .filter(gm => gm.groupId === chat.groupId && gm.status === 'JOINED')
          .map(gm => {
            const u = MOCK_USERS.find(user => user.id === gm.userId);
            return u ? { ...u, groupRole: gm.role } : null;
          }).filter(u => !!u);
      }

      const chatMessages = messages
        .filter(m => m.chatId === chatId)
        .map(msg => {
          const sender = MOCK_USERS.find(u => u.id === msg.senderId);
          return {
            ...msg,
            senderName: sender ? sender.name : 'Unknown User',
            senderAvatar: sender ? sender.avatarUrl : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            canDelete: canDeleteMessage(userId, msg.id),
          };
        })
        .sort((a, b) => a.createdAt - b.createdAt); // Chronological

      return {
        data: {
          messages: chatMessages,
          isReadOnly,
          members: membersDetails,
          groupName: chat.type === 'GROUP' ? (groups.find(g => g.id === chat.groupId)?.name || 'Group') : undefined,
          groupId: chat.groupId,
          chatType: chat.type,
          chatRole: member.role,
        } as any,
        error: null
      };
    });
  },

  /**
   * Send a message
   */
  sendMessage: (chatId: string, senderId: string, text: string): Promise<ApiResponse<Message>> => {
    return simulateNetwork(() => {
      if (isUserBanned(senderId)) throw new Error('Banned from platform.');

      const member = chat_members.find(cm => cm.chatId === chatId && cm.userId === senderId && cm.status === 'ACTIVE');
      if (!member) throw new Error('403 Forbidden: You are not active in this chat.');

      const chat = chats.find(c => c.id === chatId);
      if (!chat) throw new Error('Chat not found.');

      // Check readonly statuses
      if (chat.type === 'EVENT' && chat.eventId) {
        const ev = MOCK_EVENTS.find(e => e.id === chat.eventId);
        if (ev?.status === 'CANCELLED') throw new Error('This chat is read-only because the event is cancelled.');
      } else if (chat.type === 'GROUP' && chat.groupId) {
        const gr = groups.find(g => g.id === chat.groupId);
        if (gr?.status === 'DISBANDED') throw new Error('This group is disbanded.');
        if (gr) {
          const ev = MOCK_EVENTS.find(e => e.id === gr.eventId);
          if (ev?.status === 'CANCELLED') throw new Error('This chat is read-only because the event is cancelled.');
        }
      }

      const newMsg: Message = {
        id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        chatId,
        senderId,
        message: text,
        createdAt: Date.now()
      };

      messages.push(newMsg);

      return { data: newMsg, error: null };
    });
  },

  /**
   * Delete a message (Sender, CHAT_ADMIN or PLATFORM_ADMIN)
   */
  deleteMessage: (userId: string, messageId: string): Promise<ApiResponse<boolean>> => {
    return simulateNetwork(() => {
      if (!canDeleteMessage(userId, messageId)) {
        throw new Error('403 Forbidden: You do not have permission to delete this message.');
      }

      const idx = messages.findIndex(m => m.id === messageId);
      if (idx === -1) throw new Error('Message not found');

      messages.splice(idx, 1);
      return { data: true, error: null };
    });
  },

  /**
   * Send plan invitations
   */
  sendPlanInvites: (eventId: string, senderId: string, receiverIds: string[]): Promise<ApiResponse<PlanInvite[]>> => {
    return simulateNetwork(() => {
      const createdInvites: PlanInvite[] = [];

      receiverIds.forEach(receiverId => {
        const duplicate = invites.find(
          i => i.eventId === eventId && i.senderId === senderId && i.receiverId === receiverId && i.status === 'pending'
        );

        if (!duplicate) {
          const invite: PlanInvite = {
            id: `invite_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            eventId,
            senderId,
            receiverId,
            status: 'pending',
            createdAt: Date.now()
          };
          invites.push(invite);
          createdInvites.push(invite);
        }
      });

      return { data: createdInvites, error: null };
    });
  },

  /**
   * Fetch invitations for a user
   */
  fetchInvites: (userId: string): Promise<ApiResponse<any[]>> => {
    return simulateNetwork(() => {
      const userInvites = invites
        .filter(i => i.receiverId === userId)
        .map(invite => {
          const sender = MOCK_USERS.find(u => u.id === invite.senderId);
          const event = MOCK_EVENTS.find(e => e.id === invite.eventId);
          return {
            ...invite,
            sender,
            event
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);

      return { data: userInvites, error: null };
    });
  },

  /**
   * Respond to invitation (Accept/Reject)
   */
  respondToInvite: (inviteId: string, status: 'accepted' | 'rejected'): Promise<ApiResponse<PlanInvite>> => {
    return simulateNetwork(() => {
      const invite = invites.find(i => i.id === inviteId);
      if (!invite) throw new Error('Invite not found');

      invite.status = status;
      return { data: invite, error: null };
    });
  }
};
