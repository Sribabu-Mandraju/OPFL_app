import React from "react";
import { View, ActivityIndicator } from "react-native";

export const LoadingState: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center bg-dark-950">
      <ActivityIndicator size="large" color="#16a34a" />
    </View>
  );
};
