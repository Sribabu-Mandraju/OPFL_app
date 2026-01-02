import React from "react";
import { Text, View } from "react-native";

interface FaucetsHeaderProps {
  tokenCount: number;
}

export const FaucetsHeader: React.FC<FaucetsHeaderProps> = ({ tokenCount }) => {
  return (
    <View className="px-5 pt-12 pb-6">
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text className="text-white text-4xl font-black mb-1">
            Testnet Faucets
          </Text>
          <Text className="text-gray-400 text-sm font-medium">
            Get free test tokens for development
          </Text>
        </View>
      </View>
      <View className="mt-4 flex-row items-center">
        <View className="bg-primary-600/10 px-3 py-1.5 rounded-full border border-primary-600/20">
          <Text className="text-primary-400 text-xs font-semibold">
            {tokenCount} Tokens Available
          </Text>
        </View>
      </View>
    </View>
  );
};
