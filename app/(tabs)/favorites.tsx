import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Favorites = () => {
  const insets = useSafeAreaInsets();

  // Calculate tab bar height: 72 + insets.bottom + 8 (padding)
  const tabBarHeight = 72 + insets.bottom + 8;

  return (
    <View
      className="flex-1 bg-dark-900"
      style={{ paddingBottom: tabBarHeight + 20 }}
    >
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-3xl font-bold text-primary-500 mb-2">
          Favorites
        </Text>
        <Text className="text-gray-400 text-center">
          Your saved items and favorites
        </Text>
      </View>
    </View>
  );
};

export default Favorites;
