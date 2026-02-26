import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const COLORS = {
  success: { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32', icon: '✅' },
  error:   { bg: '#FFEBEE', border: '#EF5350', text: '#C62828', icon: '❌' },
  info:    { bg: '#E3F2FD', border: '#42A5F5', text: '#1565C0', icon: 'ℹ️' },
};

const ToastNotification = ({ message, type, visible, onHide, duration = 3000 }: ToastProps) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const color = COLORS[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: color.bg,
          borderLeftColor: color.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={styles.icon}>{color.icon}</Text>
      <Text style={[styles.message, { color: color.text }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 9999,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

export default ToastNotification;
