import React from "react";
import { View, Text } from "react-native";

export const EmptyState: React.FC = () => {
  return (
    <View className="items-center justify-center py-16 px-4">
      <View className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
        <Text className="text-gray-400 text-center text-base">
          No tokens available
        </Text>
      </View>
    </View>
  );
};
