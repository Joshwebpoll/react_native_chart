import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Toast Types
const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Toast Configuration
const TOAST_CONFIG = {
  [TOAST_TYPES.SUCCESS]: {
    backgroundColor: "#4CAF50",
    icon: "✓",
    iconColor: "#fff",
  },
  [TOAST_TYPES.ERROR]: {
    backgroundColor: "#F44336",
    icon: "✕",
    iconColor: "#fff",
  },
  [TOAST_TYPES.WARNING]: {
    backgroundColor: "#FF9800",
    icon: "⚠",
    iconColor: "#fff",
  },
  [TOAST_TYPES.INFO]: {
    backgroundColor: "#2196F3",
    icon: "ℹ",
    iconColor: "#fff",
  },
};

// Individual Toast Item Component
const ToastItem = ({ toast, onRemove }) => {
  const translateY = useRef(new Animated.Value(100)).current; // Start from bottom
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation from bottom
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss timer
    const timer = setTimeout(() => {
      hideToast();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100, // Slide down to hide
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove(toast.id);
    });
  };

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG[TOAST_TYPES.INFO];

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Text style={styles.toastMessage}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
};

// Toast Container Component
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Subscribe to toast events (you can implement your own event system)
    const subscription = ToastManager.subscribe((toast) => {
      setToasts((prev) => [
        ...prev,
        { ...toast, id: Date.now() + Math.random() },
      ]);
    });

    return () => subscription();
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View style={styles.toastWrapper} pointerEvents="box-none">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
};

// Toast Manager - Singleton Pattern
class ToastManagerClass {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  show(toast) {
    this.subscribers.forEach((callback) => callback(toast));
  }

  success(message, duration = 3000) {
    this.show({
      type: TOAST_TYPES.SUCCESS,
      message,
      duration,
    });
  }

  error(message, duration = 4000) {
    this.show({
      type: TOAST_TYPES.ERROR,
      message,
      duration,
    });
  }

  warning(message, duration = 3500) {
    this.show({
      type: TOAST_TYPES.WARNING,
      message,
      duration,
    });
  }

  info(message, duration = 3000) {
    this.show({
      type: TOAST_TYPES.INFO,
      message,
      duration,
    });
  }
}

const ToastManager = new ToastManagerClass();

// Example Usage Component
const ToastExample = () => {
  const showSuccessToast = () => {
    ToastManager.success("Operation completed successfully!");
  };

  const showErrorToast = () => {
    ToastManager.error("Something went wrong. Please try again.");
  };

  const showWarningToast = () => {
    ToastManager.warning("Please check your input fields.");
  };

  const showInfoToast = () => {
    ToastManager.info("Here is some useful information for you.");
  };

  return (
    <View style={styles.exampleContainer}>
      <Text style={styles.exampleTitle}>Toast Component Demo</Text>

      <TouchableOpacity
        style={[styles.button, styles.successButton]}
        onPress={showSuccessToast}
      >
        <Text style={styles.buttonText}>Show Success Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.errorButton]}
        onPress={showErrorToast}
      >
        <Text style={styles.buttonText}>Show Error Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.warningButton]}
        onPress={showWarningToast}
      >
        <Text style={styles.buttonText}>Show Warning Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.infoButton]}
        onPress={showInfoToast}
      >
        <Text style={styles.buttonText}>Show Info Toast</Text>
      </TouchableOpacity>
    </View>
  );
};

// Toast Provider Component for Expo Router
const ToastProvider = ({ children }) => {
  return (
    <View style={styles.app}>
      {children}
      <ToastContainer />
    </View>
  );
};

// Main App Component (for standalone usage)
const App = () => {
  return (
    <View style={styles.app}>
      {/* <StatusBar barStyle="light-content" backgroundColor="#333" /> */}
      <ToastExample />
      <ToastContainer />
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // Toast Container Styles
  container: {
    position: "absolute",
    bottom: 0, // Changed from top: 0
    left: 0,
    right: 0,
    zIndex: 9999,
  },

  safeArea: {
    flex: 1,
  },

  toastWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "center", // Center the toasts horizontally
  },

  // Toast Item Styles
  toastContainer: {
    marginBottom: 50,
    borderRadius: 10, // More rounded for pill shape
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: "center", // Center the toast
  },

  toastContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  toastMessage: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },

  // Example Component Styles
  exampleContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  exampleTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
    textAlign: "center",
  },

  button: {
    width: width * 0.8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  successButton: {
    backgroundColor: "#4CAF50",
  },

  errorButton: {
    backgroundColor: "#F44336",
  },

  warningButton: {
    backgroundColor: "#FF9800",
  },

  infoButton: {
    backgroundColor: "#2196F3",
  },
});

export default App;
export { TOAST_TYPES, ToastContainer, ToastManager, ToastProvider };
