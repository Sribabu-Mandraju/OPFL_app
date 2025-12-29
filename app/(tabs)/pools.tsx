import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const Pools = () => {
  const insets = useSafeAreaInsets();

  // Calculate tab bar height: 72 + insets.bottom + 8 (padding)
  const tabBarHeight = 72 + insets.bottom + 8;

  const pools = [
    {
      id: 1,
      name: "ETH/USDT Pool",
      tvl: "$2.4M",
      apy: "12.5%",
      change: "+2.3%",
    },
    {
      id: 2,
      name: "BTC/USDT Pool",
      tvl: "$1.8M",
      apy: "15.2%",
      change: "+5.1%",
    },
    {
      id: 3,
      name: "SOL/USDT Pool",
      tvl: "$950K",
      apy: "18.7%",
      change: "+8.4%",
    },
    {
      id: 4,
      name: "BNB/USDT Pool",
      tvl: "$650K",
      apy: "14.3%",
      change: "+3.2%",
    },
  ];
  const scrollViewRef = useRef<ScrollView>(null);

  // Reset scroll position to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-dark-900"
      contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mx-4 mt-4 mb-4">
        <Text className="text-2xl font-bold text-white mb-2">
          Liquidity Pools
        </Text>
        <Text className="text-gray-400 text-sm mb-6">
          Provide liquidity and earn rewards
        </Text>

        {pools.map((pool) => (
          <TouchableOpacity
            key={pool.id}
            className="bg-dark-800 rounded-2xl p-4 shadow-sm border border-dark-700 mb-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-white mb-1">
                  {pool.name}
                </Text>
                <View className="flex-row items-center gap-4">
                  <View>
                    <Text className="text-xs text-gray-400">TVL</Text>
                    <Text className="text-sm font-semibold text-white">
                      {pool.tvl}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-400">APY</Text>
                    <Text className="text-sm font-semibold text-primary-500">
                      {pool.apy}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-sm font-semibold text-green-500">
                  {pool.change}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#9ca3af"
                  style={{ marginTop: 4 }}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Pools;
