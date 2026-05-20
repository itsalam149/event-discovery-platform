import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform, StatusBar as RNStatusBar, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { FeedScreen } from './src/screens/FeedScreen';
import { EventDetailScreen } from './src/screens/EventDetailScreen';
import { AttendeeListScreen } from './src/screens/AttendeeListScreen';
import { InboxScreen } from './src/screens/InboxScreen';
import { Toast } from './src/components/Toast';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

function MainLayout() {
  const { navigation, navigateTo, goBack, invites } = useApp();
  const insets = useSafeAreaInsets();
  
  const pendingCount = invites.filter(i => i.status === 'pending').length;

  // Track latest navigation state to keep Android hardware back button stable
  const navigationRef = useRef(navigation);
  useEffect(() => {
    navigationRef.current = navigation;
  }, [navigation]);

  // Intercept hardware back button press on Android
  useEffect(() => {
    const handleBackPress = () => {
      if (navigationRef.current.history.length > 1) {
        goBack();
        return true; // Prevent app exit
      }
      return false; // Exit app if on main screen
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      subscription.remove();
    };
  }, [goBack]);

  // Render current screen
  const renderScreen = () => {
    switch (navigation.currentScreen) {
      case 'Feed':
        return <FeedScreen />;
      case 'EventDetail':
        return <EventDetailScreen />;
      case 'AttendeeList':
        return <AttendeeListScreen />;
      case 'Inbox':
        return <InboxScreen />;
      default:
        return <FeedScreen />;
    }
  };

  // Bottom navigation tab bar only visible on Explore and Inbox landing pages
  const isTabBarVisible = ['Feed', 'Inbox'].includes(navigation.currentScreen);

  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Liquid-Glass Background Blobs */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient
          colors={['#090D1A', '#0B0F19', '#111827']}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Glowing Neon Blob 1 (Top Left - Purple/Indigo) */}
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.25)', 'rgba(129, 140, 248, 0.05)', 'transparent']}
          style={[styles.glowBlob, styles.blobTopLeft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Glowing Neon Blob 2 (Middle Right - Pink/Magenta) */}
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.18)', 'rgba(244, 63, 94, 0.03)', 'transparent']}
          style={[styles.glowBlob, styles.blobMidRight]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Glowing Neon Blob 3 (Bottom Left - Emerald/Teal) */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.12)', 'rgba(20, 184, 166, 0.02)', 'transparent']}
          style={[styles.glowBlob, styles.blobBottomLeft]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Global Toast */}
        <Toast />

        {/* Screen Content */}
        <View style={styles.content}>
          {renderScreen()}
        </View>

        {/* Bottom Tab Bar (Glassmorphic) */}
        {isTabBarVisible && (
          <BlurView
            intensity={Platform.OS === 'ios' ? 25 : 90}
            tint="dark"
            style={[
              styles.tabBar,
              {
                height: 56 + Math.max(insets.bottom, 8),
                paddingBottom: Math.max(insets.bottom, 8),
              }
            ]}
          >
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => navigateTo('Feed')}
              activeOpacity={0.8}
            >
              <Ionicons
                name={navigation.currentScreen === 'Feed' ? 'compass' : 'compass-outline'}
                size={24}
                color={navigation.currentScreen === 'Feed' ? '#818CF8' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: navigation.currentScreen === 'Feed' ? '#818CF8' : '#94A3B8' }
                ]}
              >
                Explore
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => navigateTo('Inbox')}
              activeOpacity={0.8}
            >
              <View style={styles.inboxIconContainer}>
                <Ionicons
                  name={navigation.currentScreen === 'Inbox' ? 'mail' : 'mail-outline'}
                  size={24}
                  color={navigation.currentScreen === 'Inbox' ? '#818CF8' : '#94A3B8'}
                />
                {pendingCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: navigation.currentScreen === 'Inbox' ? '#818CF8' : '#94A3B8' }
                ]}
              >
                Inbox
              </Text>
            </TouchableOpacity>
          </BlurView>
        )}
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: 200,
    width: 350,
    height: 350,
  },
  blobTopLeft: {
    top: -100,
    left: -100,
  },
  blobMidRight: {
    top: '35%',
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  blobBottomLeft: {
    bottom: -120,
    left: -100,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.85)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
});
