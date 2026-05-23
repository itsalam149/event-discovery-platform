import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Event, ScreenName, RouteParams, NavigationState, PlanInvite, Group, Chat, Message } from '../types';
import { mockApi, MOCK_USERS, bannedUserIds } from '../services/mockApi';

interface ToastState {
  message: string;
  type: 'success' | 'info' | 'error' | 'waitlist';
  id: number;
}

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => Promise<void>;

  // Navigation
  navigation: NavigationState;
  navigateTo: (screen: ScreenName, params?: RouteParams) => void;
  goBack: () => void;

  // Event State
  events: any[];
  isLoadingEvents: boolean;
  fetchEventsList: () => Promise<void>;
  toggleRsvp: (eventId: string) => Promise<void>;
  createNewEvent: (eventData: Omit<Event, 'id' | 'hostId' | 'status'>) => Promise<boolean>;
  editEventDetail: (eventId: string, updates: Partial<Event>) => Promise<boolean>;
  cancelEvent: (eventId: string) => Promise<boolean>;
  removeUserFromEvent: (eventId: string, targetUserId: string) => Promise<boolean>;
  updateAttendeeRole: (eventId: string, targetUserId: string, newRole: 'ATTENDEE' | 'EVENT_MODERATOR' | 'EVENT_ADMIN') => Promise<boolean>;

  // Group State
  createNewGroup: (eventId: string, name: string) => Promise<boolean>;
  joinGroup: (groupId: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  removeUserFromGroup: (groupId: string, targetUserId: string) => Promise<boolean>;
  renameGroup: (groupId: string, name: string) => Promise<boolean>;

  // Chat State
  chats: any[];
  isLoadingChats: boolean;
  fetchChatsList: () => Promise<void>;
  fetchChatMessages: (chatId: string) => Promise<any>;
  postMessage: (chatId: string, text: string) => Promise<boolean>;
  eraseMessage: (messageId: string) => Promise<boolean>;

  // Admin State
  banPlatformUser: (targetUserId: string) => Promise<boolean>;
  unbanPlatformUser: (targetUserId: string) => Promise<boolean>;
  isUserBanned: (userId: string) => boolean;

  // Invites State
  invites: any[];
  isLoadingInvites: boolean;
  fetchInvitesList: () => Promise<void>;
  respondToInvite: (inviteId: string, status: 'accepted' | 'rejected') => Promise<void>;
  sendInvites: (eventId: string, inviteeIds: string[]) => Promise<boolean>;

  // Global Toast
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'waitlist') => void;
  hideToast: () => void;

  // Simulator Helper
  simulateError: boolean;
  setSimulateError: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Alice default
  const [events, setEvents] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [simulateError, setSimulateError] = useState(false);

  // Custom Navigation state
  const [navigation, setNavigation] = useState<NavigationState>({
    currentScreen: 'Feed',
    history: [{ screen: 'Feed' }]
  });

  const prevEventsRef = useRef<any[]>([]);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Sync simulated error to API
  useEffect(() => {
    require('../services/mockApi').setSimulateErrorOnce(simulateError);
  }, [simulateError]);

  // Navigate to screen
  const navigateTo = useCallback((screen: ScreenName, params?: RouteParams) => {
    setNavigation(prev => {
      // Don't push duplicate consecutive screens
      const last = prev.history[prev.history.length - 1];
      if (last && last.screen === screen && JSON.stringify(last.params) === JSON.stringify(params)) {
        return prev;
      }
      return {
        currentScreen: screen,
        params,
        history: [...prev.history, { screen, params }]
      };
    });
  }, []);

  // Back navigation
  const goBack = useCallback(() => {
    setNavigation(prev => {
      if (prev.history.length <= 1) return prev; // Cannot go back further
      const newHistory = [...prev.history];
      newHistory.pop(); // Remove current screen
      const prevScreen = newHistory[newHistory.length - 1];
      return {
        currentScreen: prevScreen.screen,
        params: prevScreen.params,
        history: newHistory
      };
    });
  }, []);

  // Fetch events list
  const fetchEventsList = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const res = await mockApi.fetchEvents(currentUser.id);
      if (res.data) {
        const prevEvents = prevEventsRef.current;
        if (prevEvents.length > 0) {
          res.data.forEach(newEvent => {
            const oldEvent = prevEvents.find(e => e.id === newEvent.id);
            if (oldEvent && oldEvent.rsvpStatus === 'waitlisted' && newEvent.rsvpStatus === 'going') {
              showToast(`🎉 You've been promoted to GOING for "${newEvent.title}"!`, 'success');
            }
          });
        }
        setEvents(res.data);
        prevEventsRef.current = res.data;
      } else if (res.error) {
        showToast(res.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch events', 'error');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [currentUser.id, showToast]);

  // Fetch invites list
  const fetchInvitesList = useCallback(async () => {
    setIsLoadingInvites(true);
    try {
      const res = await mockApi.fetchInvites(currentUser.id);
      if (res.data) {
        setInvites(res.data);
      } else if (res.error) {
        showToast(res.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch invites', 'error');
    } finally {
      setIsLoadingInvites(false);
    }
  }, [currentUser.id, showToast]);

  // Fetch chats list
  const fetchChatsList = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const res = await mockApi.fetchChats(currentUser.id);
      if (res.data) {
        setChats(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch chats', 'error');
    } finally {
      setIsLoadingChats(false);
    }
  }, [currentUser.id, showToast]);

  // Switch Active User Profile
  const switchUser = useCallback(async (userId: string) => {
    const selectedUser = MOCK_USERS.find(u => u.id === userId);
    if (!selectedUser) return;

    setCurrentUser(selectedUser);
    showToast(`Switched active profile to ${selectedUser.name}`, 'info');

    // Clear page caches to force shimmers
    setEvents([]);
    setInvites([]);
    setChats([]);
    // Nav back to Feed screen on user switch to reset flow context
    setNavigation({
      currentScreen: 'Feed',
      history: [{ screen: 'Feed' }]
    });
  }, [showToast]);

  // Fetch initial data on user change
  useEffect(() => {
    fetchEventsList();
    fetchInvitesList();
    fetchChatsList();
  }, [currentUser.id, fetchEventsList, fetchInvitesList, fetchChatsList]);

  // RSVP / REVOKE RSVP with Optimistic UI updates
  const toggleRsvp = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const previousEvents = [...events];
    const isRsvped = event.rsvpStatus !== 'none';
    const oldStatus = event.rsvpStatus;

    // 1. OPTIMISTIC UPDATE
    setEvents(prevEvents =>
      prevEvents.map(e => {
        if (e.id !== eventId) return e;

        if (isRsvped) {
          const wasGoing = oldStatus === 'going';
          return {
            ...e,
            rsvpStatus: 'none',
            waitlistPosition: 0,
            goingCount: wasGoing ? Math.max(0, e.goingCount - 1) : e.goingCount,
            waitlistedCount: !wasGoing ? Math.max(0, e.waitlistedCount - 1) : e.waitlistedCount,
          };
        } else {
          const willBeGoing = e.goingCount < e.capacity;
          return {
            ...e,
            rsvpStatus: willBeGoing ? 'going' : 'waitlisted',
            waitlistPosition: willBeGoing ? 0 : e.waitlistedCount + 1,
            goingCount: willBeGoing ? e.goingCount + 1 : e.goingCount,
            waitlistedCount: !willBeGoing ? e.waitlistedCount + 1 : e.waitlistedCount,
          };
        }
      })
    );

    if (isRsvped) {
      showToast(`Cancelling RSVP for ${event.title}...`, 'info');
    } else {
      const willBeGoing = event.goingCount < event.capacity;
      if (willBeGoing) {
        showToast(`Securing your spot for ${event.title}...`, 'info');
      } else {
        showToast(`Joining waitlist for ${event.title}...`, 'waitlist');
      }
    }

    // 2. PESSIMISTIC NETWORK MUTATION
    try {
      if (isRsvped) {
        const res = await mockApi.cancelRsvp(eventId, currentUser.id);
        if (res.error) throw new Error(res.error);

        await fetchEventsList();
        await fetchChatsList();

        if (res.data?.promotedUser) {
          showToast(`Cancelled! ${res.data.promotedUser.name} was auto-promoted to GOING!`, 'success');
        } else {
          showToast('RSVP cancelled successfully.', 'success');
        }
      } else {
        const res = await mockApi.rsvp(eventId, currentUser.id);
        if (res.error) throw new Error(res.error);

        await fetchEventsList();
        await fetchChatsList();

        const actualReg = res.data?.registration;
        if (actualReg?.status === 'JOINED') {
          showToast(`Confirmed! You are going to "${event.title}"!`, 'success');
        } else if (actualReg?.status === 'WAITLISTED') {
          showToast(`You are on the Waitlist! Position #${actualReg.waitlistPosition}`, 'waitlist');
        }
      }
    } catch (err: any) {
      setEvents(previousEvents);
      showToast(err.message || 'Failed to update RSVP. Please try again.', 'error');
    }
  };

  // Event Moderation Services
  const createNewEvent = async (eventData: Omit<Event, 'id' | 'hostId' | 'status'>) => {
    try {
      showToast('Creating event...', 'info');
      const res = await mockApi.createEvent(currentUser.id, eventData);
      if (res.error) throw new Error(res.error);
      showToast(`Event "${res.data?.title}" created successfully!`, 'success');
      await fetchEventsList();
      await fetchChatsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to create event', 'error');
      return false;
    }
  };

  const editEventDetail = async (eventId: string, updates: Partial<Event>) => {
    try {
      showToast('Updating event details...', 'info');
      const res = await mockApi.editEvent(currentUser.id, eventId, updates);
      if (res.error) throw new Error(res.error);
      showToast('Event updated successfully.', 'success');
      await fetchEventsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to edit event', 'error');
      return false;
    }
  };

  const cancelEvent = async (eventId: string) => {
    try {
      showToast('Cancelling event...', 'info');
      const res = await mockApi.cancelEvent(currentUser.id, eventId);
      if (res.error) throw new Error(res.error);
      showToast('Event cancelled successfully.', 'success');
      await fetchEventsList();
      await fetchChatsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel event', 'error');
      return false;
    }
  };

  const removeUserFromEvent = async (eventId: string, targetUserId: string) => {
    try {
      showToast('Removing attendee...', 'info');
      const res = await mockApi.removeAttendee(currentUser.id, eventId, targetUserId);
      if (res.error) throw new Error(res.error);
      showToast('Attendee removed from event.', 'success');
      await fetchEventsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to remove attendee', 'error');
      return false;
    }
  };

  const updateAttendeeRole = async (eventId: string, targetUserId: string, newRole: 'ATTENDEE' | 'EVENT_MODERATOR' | 'EVENT_ADMIN') => {
    try {
      showToast('Updating role...', 'info');
      const res = await mockApi.updateAttendeeRole(currentUser.id, eventId, targetUserId, newRole);
      if (res.error) throw new Error(res.error);
      showToast(`User role updated to ${newRole}.`, 'success');
      await fetchEventsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
      return false;
    }
  };

  // Group Services
  const createNewGroup = async (eventId: string, name: string) => {
    try {
      showToast('Creating group...', 'info');
      const res = await mockApi.createGroup(currentUser.id, eventId, name);
      if (res.error) throw new Error(res.error);
      showToast(`Group "${res.data?.name}" created successfully!`, 'success');
      await fetchEventsList();
      await fetchChatsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to create group', 'error');
      return false;
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      showToast('Joining group...', 'info');
      const res = await mockApi.joinGroup(currentUser.id, groupId);
      if (res.error) throw new Error(res.error);
      showToast(`Joined group successfully!`, 'success');
      await fetchEventsList();
      await fetchChatsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to join group', 'error');
      return false;
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      showToast('Leaving group...', 'info');
      const res = await mockApi.leaveGroup(currentUser.id, groupId);
      if (res.error) throw new Error(res.error);
      showToast(`Left group.`, 'success');
      await fetchEventsList();
      await fetchChatsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to leave group', 'error');
      return false;
    }
  };

  const removeUserFromGroup = async (groupId: string, targetUserId: string) => {
    try {
      showToast('Removing member from group...', 'info');
      const res = await mockApi.removeGroupMember(currentUser.id, groupId, targetUserId);
      if (res.error) throw new Error(res.error);
      showToast('Member removed.', 'success');
      await fetchEventsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to remove member', 'error');
      return false;
    }
  };

  const renameGroup = async (groupId: string, name: string) => {
    try {
      showToast('Renaming group...', 'info');
      const res = await mockApi.renameGroup(currentUser.id, groupId, name);
      if (res.error) throw new Error(res.error);
      showToast('Group renamed.', 'success');
      await fetchEventsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to rename group', 'error');
      return false;
    }
  };

  // Platform Admin Hooks
  const banPlatformUser = async (targetUserId: string) => {
    try {
      showToast('Banning user platform-wide...', 'info');
      const res = await mockApi.banUser(currentUser.id, targetUserId);
      if (res.error) throw new Error(res.error);
      showToast('User has been banned and scrubbed from all contexts.', 'success');
      await fetchEventsList();
      await fetchChatsList();
      await fetchInvitesList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to ban user', 'error');
      return false;
    }
  };

  const unbanPlatformUser = async (targetUserId: string) => {
    try {
      showToast('Unbanning user...', 'info');
      const res = await mockApi.unbanUser(currentUser.id, targetUserId);
      if (res.error) throw new Error(res.error);
      showToast('User unbanned.', 'success');
      await fetchEventsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to unban user', 'error');
      return false;
    }
  };

  const isUserBanned = (userId: string) => {
    return require('../services/mockApi').isUserBanned(userId);
  };

  // Chat/Messaging Services
  const fetchChatMessages = async (chatId: string) => {
    try {
      const res = await mockApi.fetchMessages(chatId, currentUser.id);
      if (res.error) throw new Error(res.error);
      return res.data;
    } catch (err: any) {
      showToast(err.message || 'Failed to load messages', 'error');
      return null;
    }
  };

  const postMessage = async (chatId: string, text: string) => {
    try {
      const res = await mockApi.sendMessage(chatId, currentUser.id, text);
      if (res.error) throw new Error(res.error);
      await fetchChatsList();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'error');
      return false;
    }
  };

  const eraseMessage = async (messageId: string) => {
    try {
      const res = await mockApi.deleteMessage(currentUser.id, messageId);
      if (res.error) throw new Error(res.error);
      showToast('Message deleted.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to delete message', 'error');
      return false;
    }
  };

  // Respond to planning invites
  const respondToInvite = async (inviteId: string, status: 'accepted' | 'rejected') => {
    const previousInvites = [...invites];

    setInvites(prev =>
      prev.map(i => (i.id === inviteId ? { ...i, status } : i))
    );

    showToast(status === 'accepted' ? 'Accepting invite...' : 'Declining invite...', 'info');

    try {
      const res = await mockApi.respondToInvite(inviteId, status);
      if (res.error) throw new Error(res.error);

      showToast(status === 'accepted' ? 'Invitation accepted! Planning started.' : 'Invitation declined.', 'success');
      await fetchInvitesList();
    } catch (err: any) {
      setInvites(previousInvites);
      showToast(err.message || 'Failed to respond to invitation', 'error');
    }
  };

  // Send "Plan together" invites
  const sendInvites = async (eventId: string, inviteeIds: string[]): Promise<boolean> => {
    if (inviteeIds.length === 0) return false;

    showToast(`Sending plan invitations to ${inviteeIds.length} attendee(s)...`, 'info');

    try {
      const res = await mockApi.sendPlanInvites(eventId, currentUser.id, inviteeIds);
      if (res.error) throw new Error(res.error);

      showToast(`Success! Invites sent to start planning.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to send invitations', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers: MOCK_USERS,
        switchUser,
        navigation,
        navigateTo,
        goBack,
        events,
        isLoadingEvents,
        fetchEventsList,
        toggleRsvp,
        createNewEvent,
        editEventDetail,
        cancelEvent,
        removeUserFromEvent,
        updateAttendeeRole,
        createNewGroup,
        joinGroup,
        leaveGroup,
        removeUserFromGroup,
        renameGroup,
        chats,
        isLoadingChats,
        fetchChatsList,
        fetchChatMessages,
        postMessage,
        eraseMessage,
        banPlatformUser,
        unbanPlatformUser,
        isUserBanned,
        invites,
        isLoadingInvites,
        fetchInvitesList,
        respondToInvite,
        sendInvites,
        toast,
        showToast,
        hideToast,
        simulateError,
        setSimulateError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
