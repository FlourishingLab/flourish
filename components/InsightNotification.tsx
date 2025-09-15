import React, { useEffect } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

interface NotificationProps {
  message: string;
  visible: boolean;
  onPress: () => void;
  onDismiss: () => void;
  duration?: number;
}

export const InsightNotification: React.FC<NotificationProps> = ({
  message,
  visible,
  onPress,
  onDismiss,
  duration = 5000,
}) => {
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Slide out
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, onDismiss, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.notification}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.tapText}>Tap to view</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  tapText: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
});
