import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { InboxInviteCard } from '../components/InboxInviteCard';
import { ShimmerLoader } from '../components/ShimmerLoader';
import { UserSelector } from '../components/UserSelector';

export const InboxScreen: React.FC = () => {
  const { invites, isLoadingInvites, fetchInvitesList } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvitesList();
    setRefreshing(false);
  };

  // Filter invites based on selected tab
  const filteredInvites = useMemo(() => {
    if (activeTab === 'pending') {
      return invites.filter(i => i.status === 'pending');
    }
    return invites;
  }, [invites, activeTab]);

  const pendingCount = useMemo(() => {
    return invites.filter(i => i.status === 'pending').length;
  }, [invites]);

  if (isLoadingInvites && invites.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Invitations</Text>
          <UserSelector />
        </View>
        <View style={styles.tabContainerSkeleton} />
        <View style={styles.listSkeleton}>
          {[1, 2].map(n => (
            <View key={n} style={styles.cardSkeleton}>
              <View style={styles.cardHeaderSkeleton}>
                <ShimmerLoader style={styles.avatarSkeleton} />
                <View style={{ flex: 1, gap: 6 }}>
                  <ShimmerLoader style={styles.textSkeleton1} />
                  <ShimmerLoader style={styles.textSkeleton2} />
                </View>
              </View>
              <ShimmerLoader style={styles.bodySkeleton} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandSubtitle}>Inbox</Text>
          <Text style={styles.brandTitle}>Invitations</Text>
        </View>
        <UserSelector />
      </View>

      {/* Tabs / Segmented Control */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Invites
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invite List */}
      <FlatList
        data={filteredInvites}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
        renderItem={({ item }) => <InboxInviteCard invite={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'pending' ? 'mail-open-outline' : 'mail-unread-outline'}
              size={64}
              color="#334155"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' ? 'All caught up!' : 'No invites yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'pending'
                ? "You don't have any pending group plans. Go ahead and start one yourself!"
                : "You haven't sent or received any planning invitations yet."}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#818CF8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
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
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110, // leave space for absolute glass tab bar
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Skeleton Styles
  tabContainerSkeleton: {
    height: 46,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  listSkeleton: {
    paddingHorizontal: 20,
    gap: 14,
  },
  cardSkeleton: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  textSkeleton1: {
    height: 14,
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  textSkeleton2: {
    height: 14,
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bodySkeleton: {
    height: 12,
    width: '80%',
    marginLeft: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
