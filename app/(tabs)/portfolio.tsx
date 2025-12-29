import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const Portfolio = () => {
  const insets = useSafeAreaInsets();

  // Calculate tab bar height: 72 + insets.bottom + 8 (padding)
  const tabBarHeight = 72 + insets.bottom + 8;

  const holdings = [
    {
      id: 1,
      symbol: "BTC",
      name: "Bitcoin",
      amount: "0.5",
      value: "$21,450",
      change: "+5.2%",
      changePositive: true,
    },
    {
      id: 2,
      symbol: "ETH",
      name: "Ethereum",
      amount: "2.3",
      value: "$4,600",
      change: "+3.1%",
      changePositive: true,
    },
    {
      id: 3,
      symbol: "SOL",
      name: "Solana",
      amount: "50",
      value: "$5,250",
      change: "-1.8%",
      changePositive: false,
    },
    {
      id: 4,
      symbol: "MATIC",
      name: "Polygon",
      amount: "1000",
      value: "$850",
      change: "+8.4%",
      changePositive: true,
    },
  ];

  const totalValue = "$32,150";
  const totalChange = "+4.2%";
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
        {/* Portfolio Summary */}
        <View className="bg-dark-800 rounded-2xl p-6 shadow-sm border border-dark-700 mb-6">
          <Text className="text-sm text-gray-400 mb-2">
            Total Portfolio Value
          </Text>
          <Text className="text-4xl font-bold text-white mb-2">
            {totalValue}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="trending-up" size={20} color="#16a34a" />
            <Text className="text-lg font-semibold text-green-500 ml-2">
              {totalChange}
            </Text>
            <Text className="text-sm text-gray-400 ml-2">24h</Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-white mb-4">Holdings</Text>

        {holdings.map((holding) => (
          <TouchableOpacity
            key={holding.id}
            className="bg-dark-800 rounded-2xl p-4 shadow-sm border border-dark-700 mb-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-primary-900 rounded-full p-3 mr-3">
                  <Ionicons name="logo-bitcoin" size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">
                    {holding.name}
                  </Text>
                  <Text className="text-sm text-gray-400">
                    {holding.amount} {holding.symbol}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-base font-semibold text-white">
                  {holding.value}
                </Text>
                <Text
                  className={`text-sm font-semibold ${
                    holding.changePositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {holding.change}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Portfolio;
