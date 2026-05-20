import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import { ShimmerLoader } from '../components/ShimmerLoader';
import { User } from '../types';
import { BlurView } from 'expo-blur';

export const EventDetailScreen: React.FC = () => {
  const { navigation, goBack, toggleRsvp, currentUser } = useApp();
  const eventId = navigation.params?.eventId;

  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRsvping, setIsRsvping] = useState(false);

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

  const handleRsvpToggle = async () => {
    if (!eventDetail) return;
    setIsRsvping(true);
    try {
      await toggleRsvp(eventDetail.id);
      // Re-fetch detail to refresh the attendee list and official counters
      await fetchDetail();
    } finally {
      setIsRsvping(false);
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
          <ShimmerLoader style={styles.imageSkeleton} />
          <View style={styles.paddingContainer}>
            <ShimmerLoader style={styles.titleSkeleton} />
            <ShimmerLoader style={styles.metaSkeleton} />
            <ShimmerLoader style={styles.metaSkeleton} />
            <ShimmerLoader style={styles.descSkeleton} />
          </View>
        </ScrollView>
      </View>
    );
  }

  const isFull = eventDetail.goingCount >= eventDetail.capacity;
  const isGoing = eventDetail.rsvpStatus === 'going';
  const isWaitlisted = eventDetail.rsvpStatus === 'waitlisted';
  const isRegistered = isGoing || isWaitlisted;

  const fillPercentage = Math.min(1, eventDetail.goingCount / eventDetail.capacity);

  // Find host details
  const host = mockApi.fetchEvents !== undefined ? require('../services/mockApi').MOCK_USERS.find((u: User) => u.id === eventDetail.hostId) : null;

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
            <Image source={{ uri: eventDetail.imageUrl }} style={styles.bannerImage} />
          ) : (
            <View style={[styles.bannerImage, styles.fallbackImage]}>
              <Ionicons name="image-outline" size={60} color="#475569" />
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{eventDetail.category}</Text>
          </View>
        </View>

        <View style={styles.paddingContainer}>
          {/* Status Indicators */}
          {isRegistered && (
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

          {/* Title & Host info */}
          <Text style={styles.title}>{eventDetail.title}</Text>

          {host && (
            <View style={styles.hostRow}>
              <Image source={{ uri: host.avatarUrl }} style={styles.hostAvatar} />
              <View>
                <Text style={styles.hostLabel}>Hosted By</Text>
                <Text style={styles.hostName}>{host.name}</Text>
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
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${fillPercentage * 100}%`,
                    backgroundColor: isFull ? '#EF4444' : '#6366F1',
                  },
                ]}
              />
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
                  onPress={() =>
                    require('../context/AppContext').useApp().navigateTo('AttendeeList', { eventId: eventDetail.id })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View Attendee List</Text>
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
                  {eventDetail.attendees.slice(0, 5).map((attendee: User, idx: number) => (
                    <Image
                      key={attendee.id}
                      source={{ uri: attendee.avatarUrl }}
                      style={[styles.overlapAvatar, { left: idx * 24 }]}
                    />
                  ))}
                  {eventDetail.goingCount > 5 && (
                    <View style={[styles.overlapAvatarPlus, { left: 5 * 24 }]}>
                      <Text style={styles.overlapAvatarPlusText}>+{eventDetail.goingCount - 5}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.attendeesSnippetText}>
                  {eventDetail.attendees.slice(0, 2).map((a: User) => a.name.split(' ')[0]).join(', ')}
                  {eventDetail.goingCount > 2 ? ` and ${eventDetail.goingCount - 2} others` : ' going'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom RSVP Button */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 25 : 90}
        tint="dark"
        style={styles.stickyFooter}
      >
        <TouchableOpacity
          style={[
            styles.footerBtn,
            isRegistered ? styles.footerBtnCancel : isFull ? styles.footerBtnWaitlist : styles.footerBtnConfirm,
          ]}
          onPress={handleRsvpToggle}
          disabled={isRsvping}
          activeOpacity={0.8}
        >
          {isRsvping ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.footerBtnText}>
                {isGoing
                  ? 'Cancel RSVP'
                  : isWaitlisted
                  ? 'Leave Waitlist'
                  : isFull
                  ? 'Join Waitlist'
                  : 'RSVP for Event'}
              </Text>
              <Ionicons
                name={
                  isRegistered
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
    paddingBottom: 110, // leave space for absolute glass sticky footer
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
  bannerIcon: {
    marginRight: 10,
  },
  statusBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
  footerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  footerBtnIcon: {
    marginLeft: 8,
  },

  // Skeleton Styles
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
});
