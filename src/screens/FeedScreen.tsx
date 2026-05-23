import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { ShimmerLoader } from '../components/ShimmerLoader';
import { UserSelector } from '../components/UserSelector';

const CATEGORIES = ['All', 'Music', 'Entertainment', 'Wellness', 'Technology', 'Design'];

export const FeedScreen: React.FC = () => {
  const { events, isLoadingEvents, fetchEventsList } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEventsList();
    setRefreshing(false);
  };

  // Filter events based on search query and category
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  // Loading skeleton state
  if (isLoadingEvents && events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Antigravity</Text>
          <UserSelector />
        </View>

        <View style={styles.searchBarSkeleton} />
        <View style={styles.categoryRowSkeleton} />

        <View style={styles.skeletonList}>
          {[1, 2].map(n => (
            <View key={n} style={styles.cardSkeleton}>
              <ShimmerLoader style={styles.cardImageSkeleton} />
              <View style={styles.cardBodySkeleton}>
                <ShimmerLoader style={styles.cardTitleSkeleton} />
                <ShimmerLoader style={styles.cardTextSkeleton} />
                <ShimmerLoader style={styles.cardTextSkeleton2} />
              </View>
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
          <Text style={styles.brandSubtitle}>Discover</Text>
          <Text style={styles.brandTitle}>Events</Text>
        </View>
        <UserSelector />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map(category => {
            const isSelected = category === selectedCategory;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.categoryBtn, isSelected && styles.categoryBtnSelected]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryBtnText, isSelected && styles.categoryBtnTextSelected]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Event Feed List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#334155" />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters or search query to discover new events.
            </Text>
            {(searchQuery.length > 0 || selectedCategory !== 'All') && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
  },
  categoriesWrapper: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryBtnSelected: {
    backgroundColor: '#818CF8',
    borderColor: '#818CF8',
  },
  categoryBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryBtnTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 110, // leave space for absolute glass tab bar
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    marginBottom: 20,
  },
  clearBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Skeleton Styles
  searchBarSkeleton: {
    height: 48,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  categoryRowSkeleton: {
    height: 36,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 18,
    width: '80%',
    marginLeft: 20,
    marginBottom: 20,
  },
  skeletonList: {
    paddingHorizontal: 20,
  },
  cardSkeleton: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardImageSkeleton: {
    height: 160,
    width: '100%',
  },
  cardBodySkeleton: {
    padding: 16,
    gap: 8,
  },
  cardTitleSkeleton: {
    height: 18,
    width: '70%',
    marginBottom: 6,
  },
  cardTextSkeleton: {
    height: 12,
    width: '90%',
  },
  cardTextSkeleton2: {
    height: 12,
    width: '50%',
  },
});
