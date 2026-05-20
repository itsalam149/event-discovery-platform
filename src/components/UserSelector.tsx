import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, ScrollView, Switch, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BlurView } from 'expo-blur';

export const UserSelector: React.FC = () => {
  const { currentUser, allUsers, switchUser, simulateError, setSimulateError } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.profileBadge}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: currentUser.avatarUrl }} style={styles.badgeAvatar} />
        <View style={styles.badgeTextContainer}>
          <Text style={styles.badgeTitle}>Viewing As</Text>
          <Text style={styles.badgeName} numberOfLines={1}>
            {currentUser.name}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#6366F1" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={{ width: '100%' }} pointerEvents="auto">
            <BlurView
              intensity={Platform.OS === 'ios' ? 30 : 90}
              tint="dark"
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <View style={styles.headerIndicator} />
                <Text style={styles.modalTitle}>Demo Control Panel</Text>
                <Text style={styles.modalSubtitle}>
                  Switch profiles to test waitlisting, promotions, and plans between users.
                </Text>
              </View>

              <ScrollView contentContainerStyle={styles.usersList}>
                {allUsers.map(user => {
                  const isActive = user.id === currentUser.id;
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[styles.userRow, isActive && styles.activeUserRow]}
                      onPress={() => {
                        switchUser(user.id);
                        setModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: user.avatarUrl }} style={styles.rowAvatar} />
                      <View style={styles.rowText}>
                        <Text style={[styles.rowName, isActive && styles.activeRowText]}>
                          {user.name}
                        </Text>
                        <Text style={styles.rowEmail}>{user.email}</Text>
                      </View>
                      {isActive ? (
                        <Ionicons name="checkmark-circle" size={24} color="#818CF8" />
                      ) : (
                        <View style={styles.rowCheckboxPlaceholder} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.separator} />

              {/* Error Simulator Control */}
              <View style={styles.simulatorRow}>
                <View style={styles.simulatorLeft}>
                  <Ionicons name="bug-outline" size={20} color="#EF4444" style={styles.simulatorIcon} />
                  <View>
                    <Text style={styles.simulatorTitle}>Simulate API Network Failure</Text>
                    <Text style={styles.simulatorSubtitle}>
                      Forces the next mutation to fail (test optimistic state rollback)
                    </Text>
                  </View>
                </View>
                <Switch
                  value={simulateError}
                  onValueChange={setSimulateError}
                  trackColor={{ false: 'rgba(255,255,255,0.08)', true: '#EF4444' }}
                  thumbColor={simulateError ? '#FFFFFF' : '#94A3B8'}
                />
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#818CF8',
  },
  badgeTextContainer: {
    marginRight: 6,
    maxWidth: 100,
  },
  badgeTitle: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  badgeName: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  usersList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeUserRow: {
    borderColor: '#818CF8',
    backgroundColor: 'rgba(129, 140, 248, 0.08)',
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  activeRowText: {
    color: '#818CF8',
  },
  rowEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rowCheckboxPlaceholder: {
    width: 24,
    height: 24,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
    marginHorizontal: 20,
  },
  simulatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    marginBottom: 16,
  },
  simulatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  simulatorIcon: {
    marginRight: 12,
  },
  simulatorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FCA5A5',
  },
  simulatorSubtitle: {
    fontSize: 11,
    color: '#F87171',
    lineHeight: 14,
    marginTop: 2,
    maxWidth: '90%',
  },
  closeButton: {
    backgroundColor: '#818CF8',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
