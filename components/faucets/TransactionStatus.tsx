import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";

interface TransactionStatusProps {
  status: "idle" | "pending" | "confirming" | "success" | "failed";
  txHash?: string;
  tokenSymbol?: string;
  onViewTransaction?: () => void;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  txHash,
  tokenSymbol,
  onViewTransaction,
}) => {
  // All hooks must be called unconditionally at the top
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  // Fade animation effect
  useEffect(() => {
    if (status !== "idle") {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [status, fadeAnim]);

  // Spin animation effect for confirming status
  useEffect(() => {
    if (status === "confirming") {
      const spin = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      spinValue.setValue(0);
    }
  }, [status, spinValue]);

  // Interpolate spin value
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Early return after all hooks are called
  if (status === "idle") return null;

  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: "time-outline" as const,
          text: "Pending",
          color: "#f59e0b",
          bgColor: "rgba(245, 158, 11, 0.1)",
          borderColor: "rgba(245, 158, 11, 0.3)",
        };
      case "confirming":
        return {
          icon: "sync-outline" as const,
          text: "Confirming...",
          color: "#3b82f6",
          bgColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "rgba(59, 130, 246, 0.3)",
        };
      case "success":
        return {
          icon: "checkmark-circle" as const,
          text: "Confirmed",
          color: "#16a34a",
          bgColor: "rgba(22, 163, 74, 0.1)",
          borderColor: "rgba(22, 163, 74, 0.3)",
        };
      case "failed":
        return {
          icon: "close-circle" as const,
          text: "Failed",
          color: "#ef4444",
          bgColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "rgba(239, 68, 68, 0.3)",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const handleViewTransaction = () => {
    if (txHash && onViewTransaction) {
      onViewTransaction();
    } else if (txHash) {
      Linking.openURL(`https://sepolia.basescan.org/tx/${txHash}`);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        {status === "confirming" ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name={config.icon} size={14} color={config.color} />
          </Animated.View>
        ) : (
          <Ionicons name={config.icon} size={14} color={config.color} />
        )}
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
      {txHash && (
        <TouchableOpacity
          onPress={handleViewTransaction}
          style={styles.viewTxButton}
          activeOpacity={0.7}
        >
          <Ionicons name="open-outline" size={12} color="#16a34a" />
          <Text style={styles.viewTxText}>View TX</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  viewTxButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewTxText: {
    color: "#16a34a",
    fontSize: 11,
    fontWeight: "600",
  },
});
