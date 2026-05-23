import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { InboxInviteCard } from '../components/InboxInviteCard';
import { ShimmerLoader } from '../components/ShimmerLoader';
import { UserSelector } from '../components/UserSelector';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const InboxScreen: React.FC = () => {
  const { 
    invites, 
    isLoadingInvites, 
    fetchInvitesList,
    chats,
    isLoadingChats,
    fetchChatsList,
    fetchChatMessages,
    postMessage,
    eraseMessage,
    removeUserFromGroup,
    renameGroup,
    currentUser
  } = useApp();

  const insets = useSafeAreaInsets();
  
  // Tab states: 'invites' vs 'chats'
  const [activeTab, setActiveTab] = useState<'invites' | 'chats'>('chats');
  const [refreshing, setRefreshing] = useState(false);

  // Chat Room Overlay States
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chatRoomData, setChatRoomData] = useState<any | null>(null);
  const [isLoadingChatRoom, setIsLoadingChatRoom] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Group Settings Panel States
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [modifyingUserId, setModifyingUserId] = useState<string | null>(null);

  // Auto scroll ref for messages
  const messageListRef = useRef<FlatList>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'invites') {
      await fetchInvitesList();
    } else {
      await fetchChatsList();
    }
    setRefreshing(false);
  };

  const pendingCount = useMemo(() => {
    return invites.filter(i => i.status === 'pending').length;
  }, [invites]);

  // Load chat room messages
  const loadChatRoom = async (chat: any) => {
    setIsLoadingChatRoom(true);
    setActiveChat(chat);
    try {
      const data = await fetchChatMessages(chat.id);
      if (data) {
        setChatRoomData(data);
        setNewGroupName(data.groupName || '');
      }
    } finally {
      setIsLoadingChatRoom(false);
    }
  };

  // Refresh chat room messages (silent or with minimal indicator)
  const refreshChatRoomMessages = async () => {
    if (!activeChat) return;
    const data = await fetchChatMessages(activeChat.id);
    if (data) {
      setChatRoomData(data);
    }
  };

  // Handle post message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChat) return;
    setSendingMsg(true);
    try {
      const success = await postMessage(activeChat.id, messageText.trim());
      if (success) {
        setMessageText('');
        await refreshChatRoomMessages();
        // Scroll to end after sending
        setTimeout(() => {
          messageListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } finally {
      setSendingMsg(false);
    }
  };

  // Handle message delete
  const handleDeleteMessage = (msgId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await eraseMessage(msgId);
            if (success) {
              await refreshChatRoomMessages();
            }
          }
        }
      ]
    );
  };

  // Group Admin actions inside Chat Settings
  const handleRenameGroupSubmit = async () => {
    if (!newGroupName.trim() || !chatRoomData?.groupId) return;
    setIsRenaming(true);
    try {
      const success = await renameGroup(chatRoomData.groupId, newGroupName.trim());
      if (success) {
        await refreshChatRoomMessages();
        // Update header metadata
        setActiveChat((prev: any) => prev ? { ...prev, title: newGroupName.trim() } : null);
        setShowGroupSettings(false);
      }
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKickGroupMember = async (targetUser: any) => {
    if (!chatRoomData?.groupId) return;
    Alert.alert(
      'Kick Member',
      `Are you sure you want to remove ${targetUser.name} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Kick', 
          style: 'destructive',
          onPress: async () => {
            setModifyingUserId(targetUser.id);
            try {
              const success = await removeUserFromGroup(chatRoomData.groupId, targetUser.id);
              if (success) {
                await refreshChatRoomMessages();
              }
            } finally {
              setModifyingUserId(null);
            }
          }
        }
      ]
    );
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderChatItem = ({ item }: { item: any }) => {
    const timeStr = formatTime(item.lastMessageTime);
    
    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() => loadChatRoom(item)}
        activeOpacity={0.7}
      >
        <View style={styles.chatIconBg}>
          <Ionicons name={item.icon} size={20} color="#818CF8" />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Text style={styles.chatTitle} numberOfLines={1}>{item.title}</Text>
              {item.role === 'CHAT_ADMIN' && (
                <View style={styles.adminTag}>
                  <Text style={styles.adminTagText}>Admin</Text>
                </View>
              )}
            </View>
            <Text style={styles.chatTime}>{timeStr}</Text>
          </View>
          <Text style={styles.chatPreview} numberOfLines={1}>{item.lastMessageText}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#475569" />
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    const isMe = item.senderId === currentUser.id;
    const timeStr = formatTime(item.createdAt);

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        {!isMe && (
          <Image source={{ uri: item.senderAvatar }} style={styles.messageAvatar} />
        )}
        <View style={styles.messageBubbleContainer}>
          {!isMe && (
            <Text style={styles.messageSenderName}>{item.senderName}</Text>
          )}
          <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={styles.messageText}>{item.message}</Text>
            <View style={styles.messageMeta}>
              <Text style={styles.messageTime}>{timeStr}</Text>
              {item.canDelete && (
                <TouchableOpacity onPress={() => handleDeleteMessage(item.id)} style={styles.deleteMsgBtn}>
                  <Ionicons name="trash-outline" size={11} color="rgba(255, 255, 255, 0.4)" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandSubtitle}>Inbox</Text>
          <Text style={styles.brandTitle}>Messages</Text>
        </View>
        <UserSelector />
      </View>

      {/* Tabs Control */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
            Chats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'invites' && styles.activeTab]}
          onPress={() => setActiveTab('invites')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'invites' && styles.activeTabText]}>
            Invitations
          </Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* List content */}
      {activeTab === 'invites' ? (
        <FlatList
          data={invites}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
          renderItem={({ item }) => <InboxInviteCard invite={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-open-outline" size={64} color="#334155" />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any pending group plans. Go ahead and start one yourself!
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
          renderItem={renderChatItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#334155" />
              <Text style={styles.emptyTitle}>No active chats</Text>
              <Text style={styles.emptySubtitle}>
                Join event planning groups or RSVP to events to start conversations.
              </Text>
            </View>
          }
        />
      )}

      {/* Chat Room Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={!!activeChat}
        onRequestClose={() => {
          setActiveChat(null);
          setChatRoomData(null);
          setShowGroupSettings(false);
        }}
      >
        <View style={[styles.chatRoomContainer, { paddingTop: Platform.OS === 'ios' ? 44 : 20 }]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Chat Room Header */}
            <View style={styles.chatRoomHeader}>
              <TouchableOpacity
                onPress={() => {
                  setActiveChat(null);
                  setChatRoomData(null);
                  setShowGroupSettings(false);
                }}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
              </TouchableOpacity>
              
              <View style={styles.chatRoomHeaderInfo}>
                <Text style={styles.chatRoomHeaderTitle} numberOfLines={1}>
                  {activeChat?.title}
                </Text>
                <Text style={styles.chatRoomHeaderSubtitle}>
                  {activeChat?.type === 'EVENT' ? 'Event Chat Room' : 'Group Chat Room'}
                </Text>
              </View>

              {activeChat?.type === 'GROUP' && chatRoomData && (
                <TouchableOpacity
                  onPress={() => setShowGroupSettings(!showGroupSettings)}
                  style={styles.settingsBtn}
                >
                  <Ionicons 
                    name={showGroupSettings ? "chatbubble-ellipses-outline" : "settings-outline"} 
                    size={22} 
                    color="#F8FAFC" 
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Chat Room Body */}
            {isLoadingChatRoom && !chatRoomData ? (
              <View style={styles.chatLoadingBox}>
                <ActivityIndicator size="large" color="#818CF8" />
                <Text style={styles.chatLoadingText}>Securing connection...</Text>
              </View>
            ) : showGroupSettings ? (
              /* Group Settings view */
              <ScrollView style={styles.settingsPanel} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.settingsSectionTitle}>Group Administration</Text>
                
                {/* Rename Group form (GROUP_ADMIN or PLATFORM_ADMIN) */}
                {(chatRoomData?.chatRole === 'CHAT_ADMIN' || currentUser.globalRole === 'PLATFORM_ADMIN') ? (
                  <View style={styles.settingsCard}>
                    <Text style={styles.settingsCardLabel}>Rename Group</Text>
                    <View style={styles.renameRow}>
                      <TextInput
                        style={styles.renameInput}
                        value={newGroupName}
                        onChangeText={setNewGroupName}
                        placeholder="Group Name"
                        placeholderTextColor="#64748B"
                      />
                      <TouchableOpacity
                        style={styles.renameBtn}
                        disabled={isRenaming || !newGroupName.trim()}
                        onPress={handleRenameGroupSubmit}
                      >
                        {isRenaming ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.renameBtnText}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                {/* Group Member management */}
                <Text style={styles.settingsCardLabel}>Group Members ({chatRoomData?.members?.length || 0})</Text>
                <View style={styles.membersList}>
                  {chatRoomData?.members?.map((member: any) => {
                    const isTargetMe = member.id === currentUser.id;
                    const canKick = (chatRoomData?.chatRole === 'CHAT_ADMIN' || currentUser.globalRole === 'PLATFORM_ADMIN') && !isTargetMe;
                    
                    return (
                      <View key={member.id} style={styles.memberRow}>
                        <View style={styles.memberRowLeft}>
                          <Image source={{ uri: member.avatarUrl }} style={styles.memberAvatar} />
                          <View>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                          </View>
                          {member.groupRole === 'GROUP_ADMIN' && (
                            <View style={styles.groupAdminTag}>
                              <Text style={styles.groupAdminTagText}>Host</Text>
                            </View>
                          )}
                        </View>
                        {canKick && (
                          <TouchableOpacity
                            style={styles.kickMemberBtn}
                            disabled={modifyingUserId === member.id}
                            onPress={() => handleKickGroupMember(member)}
                          >
                            {modifyingUserId === member.id ? (
                              <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                              <Text style={styles.kickMemberBtnText}>Kick</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              /* Message list */
              <View style={{ flex: 1 }}>
                {chatRoomData?.isReadOnly && (
                  <View style={styles.readOnlyBanner}>
                    <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
                    <Text style={styles.readOnlyBannerText}>
                      This chat is read-only.
                    </Text>
                  </View>
                )}
                
                <FlatList
                  ref={messageListRef}
                  data={chatRoomData?.messages || []}
                  keyExtractor={item => item.id}
                  renderItem={renderMessageItem}
                  contentContainerStyle={styles.messageList}
                  onContentSizeChange={() => messageListRef.current?.scrollToEnd({ animated: false })}
                  onLayout={() => messageListRef.current?.scrollToEnd({ animated: false })}
                />

                {/* Input row */}
                {!chatRoomData?.isReadOnly && (
                  <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                    <TextInput
                      style={styles.chatInput}
                      value={messageText}
                      onChangeText={setMessageText}
                      placeholder="Message..."
                      placeholderTextColor="#64748B"
                      multiline={true}
                    />
                    <TouchableOpacity
                      style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
                      disabled={sendingMsg || !messageText.trim()}
                      onPress={handleSendMessage}
                    >
                      {sendingMsg ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    paddingBottom: 110,
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
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  chatIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chatInfo: {
    flex: 1,
    marginRight: 10,
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  adminTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  adminTagText: {
    fontSize: 7.5,
    color: '#34D399',
    fontWeight: '900',
  },
  chatTime: {
    fontSize: 11,
    color: '#64748B',
  },
  chatPreview: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },

  // Chat Room Styles
  chatRoomContainer: {
    flex: 1,
    backgroundColor: '#090D1A',
  },
  chatRoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0B0F19',
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  chatRoomHeaderInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  chatRoomHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  chatRoomHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  chatLoadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  chatLoadingText: {
    color: '#64748B',
    fontSize: 13,
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
  },
  readOnlyBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messageList: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  messageRowMe: {
    alignSelf: 'flex-end',
  },
  messageRowOther: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubbleContainer: {
    flex: 1,
  },
  messageSenderName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  messageText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  deleteMsgBtn: {
    padding: 2,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0B0F19',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '500',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },

  // Settings Panel Styles
  settingsPanel: {
    flex: 1,
    backgroundColor: '#090D1A',
    padding: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
    gap: 12,
  },
  settingsCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  renameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  renameInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 12,
    color: '#F8FAFC',
    fontSize: 14,
  },
  renameBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  membersList: {
    gap: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  memberRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  memberName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  memberEmail: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  groupAdminTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 4,
    paddingVertical: 0.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  groupAdminTagText: {
    fontSize: 7,
    color: '#34D399',
    fontWeight: '900',
  },
  kickMemberBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  kickMemberBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
});
