import { User, Event, EventRegistration, PlanInvite } from '../types';

// Mock Users Database
export const MOCK_USERS: User[] = [
  {
    id: 'user_alice',
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'user_bob',
    name: 'Bob Johnson',
    email: 'bob.j@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user_charlie',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'user_diana',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'user_evan',
    name: 'Evan Wright',
    email: 'evan.w@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  },
  {
    id: 'user_fiona',
    name: 'Fiona Gallagher (Long Name Example for Truncation Support)',
    email: 'fiona.g@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
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
  }
];

// Seed In-Memory Database States
let registrations: EventRegistration[] = [
  // Sunset Rooftop Jazz: 2 Going (Fully Loaded)
  { eventId: 'event_jazz', userId: 'user_bob', status: 'going', waitlistPosition: 0, createdAt: Date.now() - 3600000 * 2 },
  { eventId: 'event_jazz', userId: 'user_charlie', status: 'going', waitlistPosition: 0, createdAt: Date.now() - 3600000 },
  
  // Starlight Cinema: 1 Going (Diana), 1 Waitlisted (Bob)
  { eventId: 'event_cinema', userId: 'user_diana', status: 'going', waitlistPosition: 0, createdAt: Date.now() - 3600000 * 3 },
  { eventId: 'event_cinema', userId: 'user_bob', status: 'waitlisted', waitlistPosition: 1, createdAt: Date.now() - 3600000 * 2 },

  // DeepMind Hackathon: 2 Going
  { eventId: 'event_ai', userId: 'user_bob', status: 'going', waitlistPosition: 0, createdAt: Date.now() - 3600000 },
  { eventId: 'event_ai', userId: 'user_diana', status: 'going', waitlistPosition: 0, createdAt: Date.now() - 3600000 * 2 },
];

let invites: PlanInvite[] = [
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

// Error simulator control
let simulateErrorOnce = false;

export const setSimulateErrorOnce = (val: boolean) => {
  simulateErrorOnce = val;
};

// Latency Simulation Helper
const simulateNetwork = <T>(fn: () => T): Promise<T> => {
  const latency = Math.floor(Math.random() * (1500 - 300 + 1)) + 300; // 300ms to 1500ms
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

// Service Layer Interface
export const mockApi = {
  /**
   * Fetch all events with status for the current active user
   */
  fetchEvents: (currentUserId: string): Promise<ApiResponse<any[]>> => {
    return simulateNetwork(() => {
      const eventsWithMetadata = MOCK_EVENTS.map(event => {
        const eventRegs = registrations.filter(r => r.eventId === event.id);
        const goingCount = eventRegs.filter(r => r.status === 'going').length;
        const waitlistedCount = eventRegs.filter(r => r.status === 'waitlisted').length;
        
        const userReg = eventRegs.find(r => r.userId === currentUserId);
        
        return {
          ...event,
          goingCount,
          waitlistedCount,
          rsvpStatus: userReg ? userReg.status : 'none',
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
      const goingCount = eventRegs.filter(r => r.status === 'going').length;
      const waitlistedCount = eventRegs.filter(r => r.status === 'waitlisted').length;

      // Extract attendee details (going users)
      const attendees = eventRegs
        .filter(r => r.status === 'going')
        .map(r => MOCK_USERS.find(u => u.id === r.userId))
        .filter((u): u is User => !!u);

      const userReg = eventRegs.find(r => r.userId === currentUserId);

      return {
        data: {
          ...event,
          goingCount,
          waitlistedCount,
          rsvpStatus: userReg ? userReg.status : 'none',
          waitlistPosition: userReg ? userReg.waitlistPosition : 0,
          attendees,
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
      const event = MOCK_EVENTS.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      // Check if already registered
      const existing = registrations.find(r => r.eventId === eventId && r.userId === userId);
      if (existing) {
        return { data: { registration: existing }, error: null };
      }

      const eventRegs = registrations.filter(r => r.eventId === eventId);
      const goingCount = eventRegs.filter(r => r.status === 'going').length;

      let registration: EventRegistration;

      if (goingCount < event.capacity) {
        registration = {
          eventId,
          userId,
          status: 'going',
          waitlistPosition: 0,
          createdAt: Date.now()
        };
      } else {
        const waitlistedCount = eventRegs.filter(r => r.status === 'waitlisted').length;
        registration = {
          eventId,
          userId,
          status: 'waitlisted',
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
      registrations.splice(index, 1);

      let promotedUser: User | null = null;

      if (canceledReg.status === 'going') {
        // Find waitlisted users for this event
        const waitlist = registrations
          .filter(r => r.eventId === eventId && r.status === 'waitlisted')
          .sort((a, b) => a.waitlistPosition - b.waitlistPosition);

        if (waitlist.length > 0) {
          // Promote the first waitlisted user
          const promotedReg = waitlist[0];
          promotedReg.status = 'going';
          promotedReg.waitlistPosition = 0;

          // Find full User model
          promotedUser = MOCK_USERS.find(u => u.id === promotedReg.userId) || null;

          // Shift remaining waitlisted users up
          for (let i = 1; i < waitlist.length; i++) {
            waitlist[i].waitlistPosition = i; // since index 1 is now position 1, 2 is position 2, etc.
          }
        }
      } else {
        // Canceled user was waitlisted, shift other waitlisted users up
        const waitlist = registrations
          .filter(r => r.eventId === eventId && r.status === 'waitlisted')
          .sort((a, b) => a.waitlistPosition - b.waitlistPosition);
        
        // Re-index all waitlist positions to ensure sequential integers
        waitlist.forEach((reg, i) => {
          reg.waitlistPosition = i + 1;
        });
      }

      return { data: { promotedUser }, error: null };
    });
  },

  /**
   * Send plan invitations
   */
  sendPlanInvites: (eventId: string, senderId: string, receiverIds: string[]): Promise<ApiResponse<PlanInvite[]>> => {
    return simulateNetwork(() => {
      const createdInvites: PlanInvite[] = [];

      receiverIds.forEach(receiverId => {
        // Prevent duplicate pending invites
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
        // Sort newest first
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
