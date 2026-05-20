import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface InboxInviteCardProps {
  invite: {
    id: string;
    eventId: string;
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: number;
    sender?: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    event?: {
      id: string;
      title: string;
      date: string;
      location: string;
    };
  };
}

export const InboxInviteCard: React.FC<InboxInviteCardProps> = ({ invite }) => {
  const { respondToInvite } = useApp();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleResponse = async (status: 'accepted' | 'rejected') => {
    setIsProcessing(status);
    try {
      await respondToInvite(invite.id, status);
    } finally {
      setIsProcessing(null);
    }
  };

  const senderName = invite.sender?.name || 'Someone';
  const eventTitle = invite.event?.title || 'Unknown Event';
  const eventDate = invite.event?.date || 'Unknown Date';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: invite.sender?.avatarUrl }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.sender}>
            <Text style={styles.bold}>{senderName}</Text> invited you to plan
          </Text>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {eventTitle}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color="#64748B" />
          <Text style={styles.metaText}>{eventDate}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer / Actions */}
      <View style={styles.footer}>
        {invite.status === 'pending' ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnReject]}
              onPress={() => handleResponse('rejected')}
              disabled={isProcessing !== null}
              activeOpacity={0.7}
            >
              {isProcessing === 'rejected' ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color="#EF4444" style={styles.btnIcon} />
                  <Text style={styles.textReject}>Decline</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnAccept]}
              onPress={() => handleResponse('accepted')}
              disabled={isProcessing !== null}
              activeOpacity={0.7}
            >
              {isProcessing === 'accepted' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" style={styles.btnIcon} />
                  <Text style={styles.textAccept}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusRow}>
            {invite.status === 'accepted' ? (
              <View style={[styles.statusBadge, styles.badgeAccepted]}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.statusTextAccepted}>Accepted & Planning</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.badgeRejected]}>
                <Ionicons name="close-circle" size={14} color="#EF4444" />
                <Text style={styles.statusTextRejected}>Declined</Text>
              </View>
            )}
            <Text style={styles.timeAgo}>
              {new Date(invite.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerText: {
    flex: 1,
  },
  sender: {
    color: '#94A3B8',
    fontSize: 13,
  },
  bold: {
    fontWeight: '700',
    color: '#F1F5F9',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#818CF8',
    marginTop: 2,
  },
  body: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 52, // align text with header content
  },
  metaText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  footer: {
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    flex: 0.48, // split 50/50 with gap
    borderWidth: 1,
  },
  btnReject: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  btnAccept: {
    backgroundColor: '#818CF8',
    borderColor: '#818CF8',
  },
  btnIcon: {
    marginRight: 6,
  },
  textReject: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  textAccept: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    borderWidth: 1,
  },
  badgeAccepted: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  statusTextAccepted: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  statusTextRejected: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  timeAgo: {
    color: '#64748B',
    fontSize: 11,
  },
});
