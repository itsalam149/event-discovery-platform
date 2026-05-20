import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Event, ScreenName, RouteParams, NavigationState, PlanInvite } from '../types';
import { mockApi, MOCK_USERS } from '../services/mockApi';

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
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
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
        // Check for promotion toast feedback!
        // If the current user was "waitlisted" previously and is now "going", show a celebration toast!
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

  // Switch Active User Profile
  const switchUser = useCallback(async (userId: string) => {
    const selectedUser = MOCK_USERS.find(u => u.id === userId);
    if (!selectedUser) return;
    
    setCurrentUser(selectedUser);
    showToast(`Switched active profile to ${selectedUser.name}`, 'info');
    
    // Clear page caches to force shimmers
    setEvents([]);
    setInvites([]);
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
  }, [currentUser.id, fetchEventsList, fetchInvitesList]);

  // RSVP / REVOKE RSVP with Optimistic UI updates
  const toggleRsvp = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const previousEvents = [...events];
    const isRsvped = event.rsvpStatus !== 'none';
    const oldStatus = event.rsvpStatus;
    const oldWaitlistPos = event.waitlistPosition;

    // 1. OPTIMISTIC UPDATE
    setEvents(prevEvents =>
      prevEvents.map(e => {
        if (e.id !== eventId) return e;

        if (isRsvped) {
          // Cancelling RSVP
          const wasGoing = oldStatus === 'going';
          return {
            ...e,
            rsvpStatus: 'none',
            waitlistPosition: 0,
            goingCount: wasGoing ? Math.max(0, e.goingCount - 1) : e.goingCount,
            waitlistedCount: !wasGoing ? Math.max(0, e.waitlistedCount - 1) : e.waitlistedCount,
          };
        } else {
          // Adding RSVP
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

    // Toast immediate feedback
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

        // Fetch official state to ensure waitlists update
        await fetchEventsList();
        
        // Show success and checks if someone was promoted
        if (res.data?.promotedUser) {
          showToast(`Cancelled! ${res.data.promotedUser.name} was auto-promoted to GOING!`, 'success');
        } else {
          showToast('RSVP cancelled successfully.', 'success');
        }
      } else {
        const res = await mockApi.rsvp(eventId, currentUser.id);
        if (res.error) throw new Error(res.error);

        await fetchEventsList();

        const actualReg = res.data?.registration;
        if (actualReg?.status === 'going') {
          showToast(`Confirmed! You are going to "${event.title}"!`, 'success');
        } else if (actualReg?.status === 'waitlisted') {
          showToast(`You are on the Waitlist! Position #${actualReg.waitlistPosition}`, 'waitlist');
        }
      }
    } catch (err: any) {
      // Rollback on error
      setEvents(previousEvents);
      showToast(err.message || 'Failed to update RSVP. Please try again.', 'error');
    }
  };

  // Respond to planning invites
  const respondToInvite = async (inviteId: string, status: 'accepted' | 'rejected') => {
    const previousInvites = [...invites];

    // Optimistic UI updates
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
