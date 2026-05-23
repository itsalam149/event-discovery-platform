import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Platform, TextInput, Modal, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { mockApi, MOCK_USERS } from '../services/mockApi';
import { ShimmerLoader } from '../components/ShimmerLoader';
import { User, Group } from '../types';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const EventDetailScreen: React.FC = () => {
  const { 
    navigation, 
    goBack, 
    toggleRsvp, 
    currentUser, 
    editEventDetail, 
    cancelEvent,
    createNewGroup,
    joinGroup,
    leaveGroup,
    navigateTo
  } = useApp();
  
  const insets = useSafeAreaInsets();
  const eventId = navigation.params?.eventId;

  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRsvping, setIsRsvping] = useState(false);

  // Edit Event State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Group State
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const res = await mockApi.fetchEvent(eventId, currentUser.id);
      if (res.data) {
        setEventDetail(res.data);
        setEditTitle(res.data.title);
        setEditDesc(res.data.description);
        setEditCapacity(res.data.capacity.toString());
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

  const handleRsvpToggle = async () => {
    if (!eventDetail) return;
    setIsRsvping(true);
    try {
      await toggleRsvp(eventDetail.id);
      await fetchDetail();
    } finally {
      setIsRsvping(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!eventDetail || !editTitle.trim() || !editDesc.trim() || !editCapacity.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const capNum = parseInt(editCapacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      Alert.alert('Error', 'Capacity must be a positive number.');
      return;
    }

    setIsSaving(true);
    try {
      const success = await editEventDetail(eventDetail.id, {
        title: editTitle,
        description: editDesc,
        capacity: capNum
      });
      if (success) {
        setEditModalVisible(false);
        await fetchDetail();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEvent = () => {
    if (!eventDetail) return;
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? This will freeze RSVPs, disband all groups, and make chats read-only.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            const success = await cancelEvent(eventDetail.id);
            if (success) {
              await fetchDetail();
            }
          }
        }
      ]
    );
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !eventDetail) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    setIsCreatingGroup(true);
    try {
      const success = await createNewGroup(eventDetail.id, newGroupName.trim());
      if (success) {
        setCreateGroupModalVisible(false);
        setNewGroupName('');
        await fetchDetail();
      }
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleGroupAction = async (group: Group, inGroup: boolean) => {
    setIsJoiningGroup(group.id);
    try {
      if (inGroup) {
        // Leave Group
        Alert.alert(
          'Leave Group',
          'Are you sure you want to leave this group?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Leave', 
              style: 'destructive',
              onPress: async () => {
                const success = await leaveGroup(group.id);
                if (success) await fetchDetail();
              }
            }
          ]
        );
      } else {
        // Join Group
        const success = await joinGroup(group.id);
        if (success) await fetchDetail();
      }
    } finally {
      setIsJoiningGroup(null);
    }
  };

  if (isLoading || !eventDetail) {
    return (
      <View style={styles.container}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Event Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <ShimmerLoader style={styles.imageSkeleton as any} />
          <View style={styles.paddingContainer}>
            <ShimmerLoader style={styles.titleSkeleton as any} />
            <ShimmerLoader style={styles.metaSkeleton as any} />
            <ShimmerLoader style={styles.metaSkeleton as any} />
            <ShimmerLoader style={styles.descSkeleton as any} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const isFull = eventDetail.goingCount >= eventDetail.capacity;
  const isGoing = eventDetail.rsvpStatus === 'going';
  const isWaitlisted = eventDetail.rsvpStatus === 'waitlisted';
  const isRegistered = isGoing || isWaitlisted;
  const isCancelled = eventDetail.status === 'CANCELLED';

  const fillPercentage = Math.min(1, eventDetail.goingCount / eventDetail.capacity);

  // Host Details
  const host = MOCK_USERS.find((u: User) => u.id === eventDetail.hostId);

  // Checks context permissions
  const isEventAdmin = eventDetail.userRole === 'EVENT_ADMIN';
  const isPlatformAdmin = currentUser.globalRole === 'PLATFORM_ADMIN';
  const isSupportAdmin = currentUser.globalRole === 'SUPPORT_ADMIN';
  const hasEventAdminPrivileges = isEventAdmin || isPlatformAdmin || isSupportAdmin;

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {eventDetail.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        <View style={styles.imageContainer}>
          {eventDetail.imageUrl ? (
            <Image source={{ uri: eventDetail.imageUrl }} style={styles.bannerImage as any} />
          ) : (
            <View style={[styles.bannerImage as any, styles.fallbackImage]}>
              <Ionicons name="image-outline" size={60} color="#475569" />
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{eventDetail.category}</Text>
          </View>
        </View>

        <View style={styles.paddingContainer}>
          {/* Cancelled Banner */}
          {isCancelled && (
            <View style={[styles.statusBanner, styles.cancelledBanner]}>
              <Ionicons name="alert-circle" size={20} color="#FFFFFF" style={styles.bannerIcon} />
              <Text style={styles.statusBannerText}>
                🚨 This event has been CANCELLED.
              </Text>
            </View>
          )}

          {/* Status Indicators */}
          {!isCancelled && isRegistered && (
            <View
              style={[
                styles.statusBanner,
                isGoing ? styles.goingBanner : styles.waitlistBanner,
              ]}
            >
              <Ionicons
                name={isGoing ? 'checkmark-circle' : 'time'}
                size={20}
                color="#FFFFFF"
                style={styles.bannerIcon}
              />
              <Text style={styles.statusBannerText}>
                {isGoing
                  ? "You're confirmed for this event!"
                  : `You're Waitlisted. Position #${eventDetail.waitlistPosition}`}
              </Text>
            </View>
          )}

          {/* Admin Controls Panel */}
          {!isCancelled && hasEventAdminPrivileges && (
            <BlurView intensity={20} tint="dark" style={styles.adminCard}>
              <View style={styles.adminHeader}>
                <Ionicons name="shield-half-outline" size={18} color="#818CF8" />
                <Text style={styles.adminTitle}>
                  {isPlatformAdmin ? 'Platform Admin Panel' : isSupportAdmin ? 'Support Panel' : 'Event Host Panel'}
                </Text>
              </View>
              <View style={styles.adminActions}>
                <TouchableOpacity
                  style={[styles.adminBtn, styles.adminEditBtn]}
                  onPress={() => setEditModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.adminBtnText}>Edit Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.adminBtn, styles.adminCancelBtn]}
                  onPress={handleCancelEvent}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.adminBtnText}>Cancel Event</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}

          {/* Title & Host info */}
          <Text style={styles.title}>{eventDetail.title}</Text>

          {host && (
            <View style={styles.hostRow}>
              <Image source={{ uri: host.avatarUrl }} style={styles.hostAvatar as any} />
              <View>
                <Text style={styles.hostLabel}>Hosted By</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.hostName}>{host.name}</Text>
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>HOST</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Meta Details */}
          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <View style={styles.metaIconBg}>
                <Ionicons name="calendar" size={18} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.metaLabel}>Date and Time</Text>
                <Text style={styles.metaValue}>{eventDetail.date}</Text>
                <Text style={styles.metaSubValue}>{eventDetail.time}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaIconBg}>
                <Ionicons name="location" size={18} color="#6366F1" />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaValue}>{eventDetail.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Event description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.descriptionText}>{eventDetail.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Capacity Section */}
          <View style={styles.capacitySection}>
            <View style={styles.capacityHeader}>
              <Text style={styles.sectionTitle}>Registration Capacity</Text>
              <Text style={styles.capacityRatio}>
                {eventDetail.goingCount} / {eventDetail.capacity}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              {fillPercentage > 0 ? (
                <LinearGradient
                  colors={isFull ? ['#EF4444', '#F43F5E'] : ['#6366F1', '#818CF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressBar,
                    {
                      width: `${fillPercentage * 100}%`,
                    },
                  ]}
                />
              ) : null}
            </View>
            <Text style={styles.capacitySubtitle}>
              {isFull
                ? `Event is currently at full capacity (${eventDetail.capacity}/${eventDetail.capacity}). New RSVPs will be waitlisted.`
                : `${eventDetail.capacity - eventDetail.goingCount} spots remaining before waitlisting begins.`}
            </Text>
            {eventDetail.waitlistedCount > 0 && (
              <View style={styles.waitlistInfoRow}>
                <Ionicons name="people" size={14} color="#F59E0B" />
                <Text style={styles.waitlistCountText}>
                  {eventDetail.waitlistedCount} user(s) currently waitlisted
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Attendees List Widget */}
          <View style={styles.attendeesSection}>
            <View style={styles.attendeesHeader}>
              <Text style={styles.sectionTitle}>Attendees ({eventDetail.goingCount})</Text>
              {eventDetail.goingCount > 0 && (
                <TouchableOpacity
                  onPress={() => navigateTo('AttendeeList', { eventId: eventDetail.id })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>Manage Attendees</Text>
                </TouchableOpacity>
              )}
            </View>

            {eventDetail.goingCount === 0 ? (
              <View style={styles.emptyAttendeesBox}>
                <Ionicons name="people-outline" size={24} color="#475569" />
                <Text style={styles.emptyAttendeesText}>No attendees yet. Be the first to join!</Text>
              </View>
            ) : (
              <View style={styles.attendeeBubblesRow}>
                <View style={styles.avatarOverlapContainer}>
                  {eventDetail.attendees.slice(0, 5).map((attendee: any, idx: number) => (
                    <Image
                      key={attendee.id}
                      source={{ uri: attendee.avatarUrl }}
                      style={[styles.overlapAvatar as any, { left: idx * 24 }]}
                    />
                  ))}
                  {eventDetail.goingCount > 5 && (
                    <View style={[styles.overlapAvatarPlus, { left: 5 * 24 }]}>
                      <Text style={styles.overlapAvatarPlusText}>+{eventDetail.goingCount - 5}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.attendeesSnippetText} numberOfLines={1}>
                  {eventDetail.attendees.slice(0, 2).map((a: any) => a.name.split(' ')[0]).join(', ')}
                  {eventDetail.goingCount > 2 ? ` and ${eventDetail.goingCount - 2} others` : ' going'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Event Groups Section */}
          <View style={styles.groupsSection}>
            <View style={styles.groupsHeader}>
              <Text style={styles.sectionTitle}>Event Planning Groups</Text>
              {!isCancelled && isGoing && (
                <TouchableOpacity
                  style={styles.createGroupBtn}
                  onPress={() => setCreateGroupModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#818CF8" />
                  <Text style={styles.createGroupBtnText}>New Group</Text>
                </TouchableOpacity>
              )}
            </View>

            {!isGoing ? (
              <View style={styles.groupAlertBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                <Text style={styles.groupAlertText}>
                  Only confirmed event attendees can view and join planning groups.
                </Text>
              </View>
            ) : eventDetail.groups?.length === 0 ? (
              <View style={styles.emptyGroupsBox}>
                <Ionicons name="chatbubbles-outline" size={24} color="#475569" />
                <Text style={styles.emptyGroupsText}>No planning groups have been formed yet.</Text>
              </View>
            ) : (
              <View style={styles.groupsList}>
                {eventDetail.groups.map((group: Group) => {
                  const groupMembersList = require('../services/mockApi').group_members;
                  const inGroup = groupMembersList.some((gm: any) => gm.groupId === group.id && gm.userId === currentUser.id && gm.status === 'JOINED');

                  return (
                    <View key={group.id} style={styles.groupRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupNameText}>{group.name}</Text>
                        <Text style={styles.groupStatusText}>Status: {group.status}</Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={[styles.groupActionBtn, inGroup ? styles.leaveGroupActionBtn : styles.joinGroupActionBtn]}
                          disabled={isJoiningGroup === group.id}
                          onPress={() => handleGroupAction(group, inGroup)}
                          activeOpacity={0.7}
                        >
                          {isJoiningGroup === group.id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.groupActionBtnText}>
                              {inGroup ? 'Leave' : 'Join'}
                            </Text>
                          )}
                        </TouchableOpacity>

                        {inGroup && (
                          <TouchableOpacity
                            style={[styles.groupActionBtn, styles.chatGroupActionBtn]}
                            onPress={() => navigateTo('Inbox')}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="chatbubble-ellipses" size={14} color="#FFFFFF" />
                            <Text style={styles.groupActionBtnText}>Chat</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom RSVP Button */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 25 : 90}
        tint="dark"
        style={[
          styles.stickyFooter,
          { paddingBottom: Math.max(insets.bottom, 16) }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.footerBtn,
            isCancelled 
              ? styles.footerBtnCancelled 
              : isRegistered 
                ? styles.footerBtnCancel 
                : isFull 
                  ? styles.footerBtnWaitlist 
                  : styles.footerBtnConfirm,
          ]}
          onPress={handleRsvpToggle}
          disabled={isRsvping || isCancelled}
          activeOpacity={0.8}
        >
          {isRsvping ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.footerBtnText}>
                {isCancelled
                  ? 'Event Cancelled'
                  : isGoing
                    ? 'Cancel RSVP'
                    : isWaitlisted
                      ? 'Leave Waitlist'
                      : isFull
                        ? 'Join Waitlist'
                        : 'RSVP for Event'}
              </Text>
              <Ionicons
                name={
                  isCancelled
                    ? 'alert-circle'
                    : isRegistered
                      ? 'close-circle'
                      : isFull
                        ? 'time-outline'
                        : 'arrow-forward'
                }
                size={18}
                color="#FFFFFF"
                style={styles.footerBtnIcon}
              />
            </>
          )}
        </TouchableOpacity>
      </BlurView>

      {/* Edit Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Event Details</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Event Title"
                placeholderTextColor="#64748B"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Event Description"
                placeholderTextColor="#64748B"
                multiline={true}
                numberOfLines={4}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Capacity</Text>
              <TextInput
                style={styles.textInput}
                value={editCapacity}
                onChangeText={setEditCapacity}
                placeholder="Capacity"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitModalBtn]}
                onPress={handleEditSubmit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalBtnTextSubmit}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Create Group Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={createGroupModalVisible}
        onRequestClose={() => setCreateGroupModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCreateGroupModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Planning Group</Text>
            <Text style={styles.modalSubtitle}>
              Organize attendees, plan rides, or schedule activities. Creating a group sets you as the Group & Chat Admin.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                style={styles.textInput}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="e.g. Carpoolers, Afternoon Coffee"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => setCreateGroupModalVisible(false)}
                disabled={isCreatingGroup}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitModalBtn]}
                onPress={handleCreateGroup}
                disabled={isCreatingGroup}
              >
                {isCreatingGroup ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalBtnTextSubmit}>Create Group</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  navTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  fallbackImage: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
  },
  paddingContainer: {
    padding: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  goingBanner: {
    backgroundColor: '#10B981',
  },
  waitlistBanner: {
    backgroundColor: '#F59E0B',
  },
  cancelledBanner: {
    backgroundColor: '#EF4444',
  },
  bannerIcon: {
    marginRight: 10,
  },
  statusBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  adminCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#818CF8',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 10,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
  },
  adminEditBtn: {
    backgroundColor: '#6366F1',
  },
  adminCancelBtn: {
    backgroundColor: '#EF4444',
  },
  adminBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    lineHeight: 28,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  hostLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  hostName: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '700',
  },
  hostBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hostBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#34D399',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 18,
  },
  metaSection: {
    gap: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  metaValue: {
    fontSize: 14,
    color: '#F1F5F9',
    fontWeight: '700',
    marginTop: 2,
  },
  metaSubValue: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  descriptionSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  descriptionText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  capacitySection: {
    gap: 8,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityRatio: {
    fontSize: 15,
    fontWeight: '800',
    color: '#818CF8',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  capacitySubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  waitlistInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  waitlistCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  attendeesSection: {
    gap: 12,
  },
  attendeesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#818CF8',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyAttendeesBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyAttendeesText: {
    color: '#64748B',
    fontSize: 12,
  },
  attendeeBubblesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  avatarOverlapContainer: {
    position: 'relative',
    height: 44,
    width: 160,
  },
  overlapAvatar: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#0B0F19',
  },
  overlapAvatarPlus: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#0B0F19',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlapAvatarPlusText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  attendeesSnippetText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    flex: 1,
  },
  groupsSection: {
    gap: 12,
  },
  groupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createGroupBtnText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '700',
  },
  groupAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  groupAlertText: {
    color: '#64748B',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  emptyGroupsBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyGroupsText: {
    color: '#64748B',
    fontSize: 12,
  },
  groupsList: {
    gap: 10,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  groupNameText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  groupStatusText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  groupActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  joinGroupActionBtn: {
    backgroundColor: '#334155',
  },
  leaveGroupActionBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  chatGroupActionBtn: {
    backgroundColor: '#6366F1',
  },
  groupActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.85)',
  },
  footerBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnConfirm: {
    backgroundColor: '#818CF8',
  },
  footerBtnWaitlist: {
    backgroundColor: '#D97706',
  },
  footerBtnCancel: {
    backgroundColor: '#EF4444',
  },
  footerBtnCancelled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  footerBtnIcon: {
    marginLeft: 8,
  },
  imageSkeleton: {
    height: 220,
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
  },
  titleSkeleton: {
    height: 24,
    width: '80%',
    marginBottom: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
  },
  metaSkeleton: {
    height: 40,
    width: '100%',
    marginBottom: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
  },
  descSkeleton: {
    height: 80,
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginTop: -8,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitModalBtn: {
    backgroundColor: '#818CF8',
  },
  modalBtnTextCancel: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 14,
  },
  modalBtnTextSubmit: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
