import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
    capacity: number;
    goingCount: number;
    waitlistedCount: number;
    rsvpStatus: 'going' | 'waitlisted' | 'none';
    waitlistPosition: number;
    category: string;
  };
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { toggleRsvp, navigateTo } = useApp();

  const isFull = event.goingCount >= event.capacity;
  const isGoing = event.rsvpStatus === 'going';
  const isWaitlisted = event.rsvpStatus === 'waitlisted';
  const isRegistered = isGoing || isWaitlisted;

  // Calculate capacity percentage
  const fillPercentage = Math.min(1, event.goingCount / event.capacity);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigateTo('EventDetail', { eventId: event.id })}
    >
      {/* Event Header Image */}
      <View style={styles.imageContainer}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
        ) : (
          <View style={[styles.eventImage, styles.fallbackImage]}>
            <Ionicons name="image-outline" size={40} color="#475569" />
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        {/* Status badges */}
        {isGoing && (
          <View style={[styles.statusBadge, styles.goingBadge]}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={styles.badgeIcon} />
            <Text style={styles.statusText}>Going</Text>
          </View>
        )}
        {isWaitlisted && (
          <View style={[styles.statusBadge, styles.waitlistBadge]}>
            <Ionicons name="time" size={14} color="#FFFFFF" style={styles.badgeIcon} />
            <Text style={styles.statusText}>Waitlist #{event.waitlistPosition}</Text>
          </View>
        )}
        {!isRegistered && isFull && (
          <View style={[styles.statusBadge, styles.fullBadge]}>
            <Text style={styles.statusText}>Full</Text>
          </View>
        )}
      </View>

      {/* Card Info Body */}
      <View style={styles.infoBody}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.date}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#94A3B8" />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {/* Capacity Progress Bar */}
        <View style={styles.capacityContainer}>
          <View style={styles.capacityLabelRow}>
            <Text style={styles.capacityTitle}>Capacity</Text>
            <Text style={styles.capacityValues}>
              {event.goingCount} / {event.capacity} Going
              {event.waitlistedCount > 0 ? ` (+${event.waitlistedCount} waitlisted)` : ''}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${fillPercentage * 100}%`,
                  backgroundColor: isFull ? '#EF4444' : '#6366F1',
                },
              ]}
            />
          </View>
        </View>

        {/* RSVP button action */}
        <TouchableOpacity
          style={[
            styles.rsvpButton,
            isRegistered ? styles.cancelButton : isFull ? styles.waitlistBtn : styles.confirmButton,
          ]}
          onPress={() => toggleRsvp(event.id)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.rsvpButtonText,
              isRegistered && styles.cancelButtonText,
            ]}
          >
            {isGoing
              ? 'Cancel RSVP'
              : isWaitlisted
              ? 'Leave Waitlist'
              : isFull
              ? 'Join Waitlist'
              : 'RSVP Now'}
          </Text>
          <Ionicons
            name={
              isRegistered
                ? 'close-circle-outline'
                : isFull
                ? 'time-outline'
                : 'arrow-forward-circle-outline'
            }
            size={16}
            color={isRegistered ? '#EF4444' : '#FFFFFF'}
            style={styles.btnIcon}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    height: 170,
    width: '100%',
    position: 'relative',
  },
  eventImage: {
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
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    borderWidth: 1,
  },
  goingBadge: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  waitlistBadge: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  fullBadge: {
    backgroundColor: '#64748B',
    borderColor: '#475569',
  },
  badgeIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoBody: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  capacityContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  capacityLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  capacityTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  capacityValues: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmButton: {
    backgroundColor: '#6366F1',
  },
  waitlistBtn: {
    backgroundColor: '#D97706',
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6,
  },
  cancelButtonText: {
    color: '#EF4444',
  },
  btnIcon: {
    marginTop: 1,
  },
});
