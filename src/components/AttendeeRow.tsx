import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';

interface AttendeeRowProps {
  user: User;
  showSelector?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isCurrentUser?: boolean;
}

export const AttendeeRow: React.FC<AttendeeRowProps> = ({
  user,
  showSelector = false,
  isSelected = false,
  onToggleSelect,
  isCurrentUser = false,
}) => {
  const Container = showSelector && !isCurrentUser ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isCurrentUser && styles.currentUserContainer,
      ]}
      onPress={showSelector && !isCurrentUser ? onToggleSelect : undefined}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youText}>You</Text>
              </View>
            )}
          </View>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>

      {showSelector && !isCurrentUser && (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
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
  selectedContainer: {
    borderColor: '#818CF8',
    backgroundColor: 'rgba(129, 140, 248, 0.08)',
  },
  currentUserContainer: {
    opacity: 0.8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    maxWidth: '85%',
  },
  email: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  youBadge: {
    backgroundColor: '#475569',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  youText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#818CF8',
    backgroundColor: '#818CF8',
  },
});
