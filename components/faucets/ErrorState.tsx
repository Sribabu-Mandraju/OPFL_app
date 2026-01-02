import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <View className="flex-1 items-center justify-center bg-dark-950 px-4">
      <View className="bg-dark-800 rounded-2xl p-6 border border-red-500/20">
        <Text className="text-red-400 text-center text-base font-semibold mb-4">
          {error}
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-sm">Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  retryButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
