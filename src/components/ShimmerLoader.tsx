import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, ViewStyle } from 'react-native';

interface ShimmerProps {
  style?: ViewStyle;
}

export const ShimmerLoader: React.FC<ShimmerProps> = ({ style }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return <Animated.View style={[styles.shimmer, style, { opacity: pulseAnim }]} />;
};

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Frosted glass-themed skeletons
    borderRadius: 8,
  },
});
