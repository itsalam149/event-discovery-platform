import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BlurView } from 'expo-blur';
import { mockApi } from '../services/mockApi';
import { AttendeeRow } from '../components/AttendeeRow';
import { ShimmerLoader } from '../components/ShimmerLoader';
import { User } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const AttendeeListScreen: React.FC = () => {
  const { 
    navigation, 
    goBack, 
    currentUser, 
    sendInvites, 
    removeUserFromEvent, 
    updateAttendeeRole, 
    banPlatformUser 
  } = useApp();

  const insets = useSafeAreaInsets();
  const eventId = navigation.params?.eventId;

  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // Tabs: 'moderate' (Moderation panel) vs 'invite' (Original Plan Together)
  const [activeTab, setActiveTab] = useState<'moderate' | 'invite'>('moderate');
  const [modifyingUserId, setModifyingUserId] = useState<string | null>(null);

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
        setSelectedIds([]);
        goBack();
      }
    } finally {
      setIsSending(false);
    }
  };

  // Moderation Actions
  const handleRemoveUser = async (targetUser: any) => {
    Alert.alert(
      'Remove Attendee',
      `Are you sure you want to remove ${targetUser.name} from the event?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            setModifyingUserId(targetUser.id);
            try {
              if (eventId) {
                const success = await removeUserFromEvent(eventId, targetUser.id);
                if (success) await fetchDetail();
              }
            } finally {
              setModifyingUserId(null);
            }
          }
        }
      ]
    );
  };

  const handleRoleToggle = async (targetUser: any) => {
    const currentRole = targetUser.eventRole;
    let nextRole: 'ATTENDEE' | 'EVENT_MODERATOR' = 'EVENT_MODERATOR';
    let actionLabel = 'Promote to Moderator';

    if (currentRole === 'EVENT_MODERATOR') {
      nextRole = 'ATTENDEE';
      actionLabel = 'Demote to Attendee';
    }

    Alert.alert(
      'Change Role',
      `Do you want to ${actionLabel.toLowerCase()} for ${targetUser.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: async () => {
            setModifyingUserId(targetUser.id);
            try {
              if (eventId) {
                const success = await updateAttendeeRole(eventId, targetUser.id, nextRole);
                if (success) await fetchDetail();
              }
            } finally {
              setModifyingUserId(null);
            }
          }
        }
      ]
    );
  };

  const handleBanUser = async (targetUser: any) => {
    Alert.alert(
      'Ban User Platform-wide',
      `🚨 WARNING: This will ban ${targetUser.name} globally. They will be kicked from ALL events, groups, and chats, and their requests will be cancelled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban Platform-Wide',
          style: 'destructive',
          onPress: async () => {
            setModifyingUserId(targetUser.id);
            try {
              const success = await banPlatformUser(targetUser.id);
              if (success) await fetchDetail();
            } finally {
              setModifyingUserId(null);
            }
          }
        }
      ]
    );
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

  const attendees: any[] = eventDetail.attendees || [];
  
  // Permissions based on event context + global roles
  const isPlatformAdmin = currentUser.globalRole === 'PLATFORM_ADMIN';
  const isEventAdmin = eventDetail.userRole === 'EVENT_ADMIN';
  const isEventMod = eventDetail.userRole === 'EVENT_MODERATOR';
  const hasModPrivileges = isPlatformAdmin || isEventAdmin || isEventMod;

  const renderModerateRow = (item: any) => {
    const isMe = item.id === currentUser.id;
    const canManageUser = hasModPrivileges && !isMe;
    
    // Check hierarchical permissions
    let canKick = false;
    let canEditRole = false;

    if (canManageUser) {
      if (isPlatformAdmin) {
        canKick = true;
        canEditRole = true;
      } else if (isEventAdmin) {
        canKick = true;
        canEditRole = true;
      } else if (isEventMod) {
        // Moderator can only kick attendees, not host/other moderators, and cannot change roles
        canKick = item.eventRole === 'ATTENDEE';
      }
    }

    return (
      <View style={styles.moderateCard}>
        <View style={styles.moderateCardLeft}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.name}>{item.name}</Text>
              {isMe && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>YOU</Text>
                </View>
              )}
              {/* Event context role badge */}
              <View style={[
                styles.roleBadge,
                item.eventRole === 'EVENT_ADMIN' 
                  ? styles.hostBadge 
                  : item.eventRole === 'EVENT_MODERATOR' 
                    ? styles.modBadge 
                    : styles.attendeeBadge
              ]}>
                <Text style={styles.roleBadgeText}>
                  {item.eventRole === 'EVENT_ADMIN' ? 'Host' : item.eventRole === 'EVENT_MODERATOR' ? 'Mod' : 'Attendee'}
                </Text>
              </View>
            </View>
            <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {modifyingUserId === item.id ? (
          <ActivityIndicator size="small" color="#818CF8" style={{ marginRight: 10 }} />
        ) : (
          canManageUser && (
            <View style={styles.actionsRow}>
              {/* Role Toggle Button (Host/Admin only) */}
              {canEditRole && item.eventRole !== 'EVENT_ADMIN' && (
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleRoleToggle(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={item.eventRole === 'EVENT_MODERATOR' ? "shield-outline" : "shield"} 
                    size={16} 
                    color="#818CF8" 
                  />
                </TouchableOpacity>
              )}

              {/* Remove Attendee Button */}
              {canKick && (
                <TouchableOpacity
                  style={[styles.actionIconBtn, styles.kickBtn]}
                  onPress={() => handleRemoveUser(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              )}

              {/* Platform Ban Button (Platform Admin only) */}
              {isPlatformAdmin && (
                <TouchableOpacity
                  style={[styles.actionIconBtn, styles.banBtn]}
                  onPress={() => handleBanUser(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="ban" size={16} color="#F43F5E" />
                </TouchableOpacity>
              )}
            </View>
          )
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.navTextContainer}>
          <Text style={styles.navTitle} numberOfLines={1}>
            Event Attendees
          </Text>
          <Text style={styles.navSubtitle} numberOfLines={1}>
            {eventDetail.title}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Segment Tab Controls */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'moderate' && styles.activeTab]}
          onPress={() => setActiveTab('moderate')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'moderate' && styles.activeTabText]}>
            Attendee List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invite' && styles.activeTab]}
          onPress={() => setActiveTab('invite')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'invite' && styles.activeTabText]}>
            Plan Together
          </Text>
        </TouchableOpacity>
      </View>

      {/* Body List */}
      <FlatList
        data={attendees}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (activeTab === 'moderate') {
            return renderModerateRow(item);
          } else {
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
          }
        }}
        ListHeaderComponent={
          activeTab === 'invite' ? (
            <View style={styles.listHeader}>
              <Text style={styles.headerTitle}>Select Attendees to Plan Together</Text>
              <Text style={styles.headerSubtitle}>
                Select one or more group members to send planning invitations for this event.
              </Text>
            </View>
          ) : (
            <View style={styles.listHeader}>
              <Text style={styles.headerTitle}>Members List ({attendees.length})</Text>
              <Text style={styles.headerSubtitle}>
                {hasModPrivileges 
                  ? 'Manage user roles, kick attendees, or ban problematic users globally.' 
                  : 'View all confirmed guests and hosts attending this event.'}
              </Text>
            </View>
          )
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
      {activeTab === 'invite' && selectedIds.length > 0 && (
        <BlurView
          intensity={Platform.OS === 'ios' ? 25 : 90}
          tint="dark"
          style={[
            styles.stickyFooter,
            { paddingBottom: Math.max(insets.bottom, 16) }
          ]}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: '#818CF8',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
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
  moderateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  moderateCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  email: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  youBadge: {
    backgroundColor: '#475569',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  hostBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  modBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  attendeeBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  roleBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  banBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderColor: 'rgba(244, 63, 94, 0.25)',
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
