import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BlurView } from 'expo-blur';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Platform.OS === 'ios' ? 60 : 40, // offset from top
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!toast) return null;

  // Icon and Colors by type
  let iconName: keyof typeof Ionicons.glyphMap = 'information-circle';
  let iconColor = '#FFFFFF';

  switch (toast.type) {
    case 'success':
      iconName = 'checkmark-circle';
      iconColor = '#10B981'; // green-500
      break;
    case 'error':
      iconName = 'alert-circle';
      iconColor = '#EF4444'; // red-500
      break;
    case 'waitlist':
      iconName = 'time';
      iconColor = '#F59E0B'; // amber-500
      break;
    case 'info':
    default:
      iconName = 'information-circle';
      iconColor = '#818CF8'; // indigo-400
      break;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 30 : 90}
        tint="dark"
        style={[styles.blurBg, { borderLeftColor: iconColor }]}
      >
        <View style={styles.content}>
          <Ionicons name={iconName} size={22} color={iconColor} style={styles.icon} />
          <Text style={styles.text} numberOfLines={2}>
            {toast.message}
          </Text>
          <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  blurBg: {
    borderRadius: 14,
    borderLeftWidth: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.35)', // extra backing fill for clarity
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: 12,
    padding: 2,
  },
});
