import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BlurView } from 'expo-blur';
import { mockApi } from '../services/mockApi';
import { AttendeeRow } from '../components/AttendeeRow';
import { ShimmerLoader } from '../components/ShimmerLoader';
import { User } from '../types';

export const AttendeeListScreen: React.FC = () => {
  const { navigation, goBack, currentUser, sendInvites } = useApp();
  const eventId = navigation.params?.eventId;

  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const fetchDetail = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const res = await mockApi.fetchEvent(eventId, currentUser.id);
      if (res.data) {
        setEventDetail(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [eventId, currentUser.id]);

  const handleToggleSelect = (userId: string) => {
    setSelectedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handlePlanTogether = async () => {
    if (selectedIds.length === 0 || !eventId) return;
    setIsSending(true);
    try {
      const success = await sendInvites(eventId, selectedIds);
      if (success) {
        // Reset selections and go back
        setSelectedIds([]);
        goBack();
      }
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading || !eventDetail) {
    return (
      <View style={styles.container}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Attendees</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.bodySkeleton}>
          {[1, 2, 3].map(n => (
            <ShimmerLoader key={n} style={styles.rowSkeleton} />
          ))}
        </View>
      </View>
    );
  }

  // Filter out any invalid attendees (e.g. undefined/null)
  const attendees: User[] = eventDetail.attendees || [];

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.navTextContainer}>
          <Text style={styles.navTitle} numberOfLines={1}>
            Attendee List
          </Text>
          <Text style={styles.navSubtitle} numberOfLines={1}>
            {eventDetail.title}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Body List */}
      <FlatList
        data={attendees}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isMe = item.id === currentUser.id;
          return (
            <AttendeeRow
              user={item}
              showSelector={true}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={() => handleToggleSelect(item.id)}
              isCurrentUser={isMe}
            />
          );
        }}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.headerTitle}>Select Attendees to Plan Together</Text>
            <Text style={styles.headerSubtitle}>
              Select one or more group members to send planning invitations for this event.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={56} color="#334155" />
            <Text style={styles.emptyTitle}>No attendees yet</Text>
            <Text style={styles.emptySubtitle}>
              Nobody is currently marked as Going to this event.
            </Text>
          </View>
        }
      />

      {/* Floating Bottom Invite Action Button */}
      {selectedIds.length > 0 && (
        <BlurView
          intensity={Platform.OS === 'ios' ? 25 : 90}
          tint="dark"
          style={styles.stickyFooter}
        >
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handlePlanTogether}
            disabled={isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.inviteButtonText}>
                  Plan Together ({selectedIds.length})
                </Text>
                <Ionicons name="paper-plane" size={16} color="#FFFFFF" style={styles.inviteButtonIcon} />
              </>
            )}
          </TouchableOpacity>
        </BlurView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  navTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  navTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  navSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110, // leave space for sticky footer
  },
  listHeader: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E2E8F0',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.85)',
  },
  inviteButton: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#818CF8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  inviteButtonIcon: {
    marginLeft: 8,
  },

  // Skeleton Styles
  bodySkeleton: {
    padding: 20,
    gap: 12,
  },
  rowSkeleton: {
    height: 68,
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
});
