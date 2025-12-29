import "@walletconnect/react-native-compat";
import { AppKitButton } from "@reown/appkit-react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import CryptoChart from "../../components/CryptoChart";
import { WalletInfoView } from "@/components/WalletInfoView";

const { width } = Dimensions.get("window");

// Popular cryptocurrencies
const cryptocurrencies = [
  { symbol: "BTC", name: "Bitcoin", icon: "logo-bitcoin" },
  { symbol: "ETH", name: "Ethereum", icon: "logo-ethereum" },
  { symbol: "BNB", name: "Binance Coin", icon: "logo-bitcoin" },
  { symbol: "SOL", name: "Solana", icon: "logo-bitcoin" },
  { symbol: "ADA", name: "Cardano", icon: "logo-bitcoin" },
  { symbol: "XRP", name: "Ripple", icon: "logo-bitcoin" },
  { symbol: "DOT", name: "Polkadot", icon: "logo-bitcoin" },
  { symbol: "DOGE", name: "Dogecoin", icon: "logo-bitcoin" },
  { symbol: "MATIC", name: "Polygon", icon: "logo-bitcoin" },
  { symbol: "AVAX", name: "Avalanche", icon: "logo-bitcoin" },
];

const Home = () => {
  const insets = useSafeAreaInsets();
  const [selectedTimeframe, setSelectedTimeframe] = React.useState("Today");
  const [selectedCrypto, setSelectedCrypto] = React.useState(
    cryptocurrencies[0]
  );
  const [showCryptoModal, setShowCryptoModal] = React.useState(false);

  const timeframes = ["Today", "Week", "Month", "0.5 Year", "Year"];
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate tab bar height: 72 + insets.bottom + 8 (padding)
  const tabBarHeight = 72 + insets.bottom + 8;

  // Reset scroll position to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1"
      style={{ backgroundColor: "black" }}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Real-time Crypto Chart */}
      <View className="mx-4 mt-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-white">Market Overview</Text>
          <TouchableOpacity
            onPress={() => setShowCryptoModal(true)}
            className="flex-row items-center bg-dark-800 px-3 py-2 rounded-lg border border-dark-700"
            activeOpacity={0.7}
          >
            <Ionicons name="logo-bitcoin" size={20} color="#16a34a" />
            <Text className="text-sm font-semibold text-white ml-2">
              {selectedCrypto.symbol}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="#9ca3af"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mb-4">
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              onPress={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-2 rounded-lg ${
                selectedTimeframe === timeframe
                  ? "bg-primary-600"
                  : "bg-dark-800"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedTimeframe === timeframe
                    ? "text-white"
                    : "text-gray-400"
                }`}
              >
                {timeframe}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CryptoChart
          symbol={selectedCrypto.symbol}
          timeframe={selectedTimeframe}
        />
      </View>

      <Modal
        visible={showCryptoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCryptoModal(false)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View
            className="bg-dark-800 rounded-t-3xl p-6 border-t border-dark-700"
            style={{ maxHeight: "80%" }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">
                Select Cryptocurrency
              </Text>
              <TouchableOpacity onPress={() => setShowCryptoModal(false)}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {cryptocurrencies.map((crypto) => (
                <TouchableOpacity
                  key={crypto.symbol}
                  onPress={() => {
                    setSelectedCrypto(crypto);
                    setShowCryptoModal(false);
                  }}
                  className={`flex-row items-center p-4 rounded-xl mb-2 ${
                    selectedCrypto.symbol === crypto.symbol
                      ? "bg-primary-900 border-2 border-primary-500"
                      : "bg-dark-700 border border-dark-600"
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="bg-primary-900 rounded-full p-2 mr-3">
                    <Ionicons name="logo-bitcoin" size={24} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-white">
                      {crypto.name}
                    </Text>
                    <Text className="text-sm text-gray-400">
                      {crypto.symbol}
                    </Text>
                  </View>
                  {selectedCrypto.symbol === crypto.symbol && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#16a34a"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Trading Graph */}

      {/* Categories: Total Loans and Statistics */}
      <View className="mx-4 mb-4 flex-row gap-3">
        <View className="flex-1 bg-dark-800 rounded-2xl p-4 shadow-sm border border-dark-700">
          <View className="flex-row items-center mb-2">
            <View className="w-1 h-8 bg-primary-600 rounded-full mr-3" />
            <Text className="text-base font-semibold text-white">
              Total Loans
            </Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Ionicons name="wallet-outline" size={24} color="#16a34a" />
            <Text className="text-2xl font-bold text-white ml-2">$45,230</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-1">Active loans</Text>
        </View>

        <View className="flex-1 bg-dark-800 rounded-2xl p-4 shadow-sm border border-dark-700">
          <View className="flex-row items-center mb-2">
            <View className="w-1 h-8 bg-primary-600 rounded-full mr-3" />
            <Text className="text-base font-semibold text-white">
              Statistics
            </Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Ionicons name="stats-chart-outline" size={24} color="#16a34a" />
            <Text className="text-2xl font-bold text-white ml-2">$90,689</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-1">Available balance</Text>
        </View>
      </View>

      {/* Pools, Loans, Auctions - Full Width Rows */}
      <View className="mx-4 mb-4">
        <Text className="text-lg font-bold text-white mb-3">Quick Access</Text>

        {/* Pools - Full Width Row */}
        <TouchableOpacity
          className="bg-dark-800 rounded-2xl p-4 shadow-sm border border-dark-700 mb-3"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-primary-900 rounded-xl p-3 mr-3">
                <Ionicons name="water" size={24} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  Pools
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Liquidity pools & staking
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-lg font-bold text-white">$2.4M</Text>
              <Text className="text-xs text-primary-500 mt-1">+12.5%</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: 12 }}
            />
          </View>
        </TouchableOpacity>

        {/* Loans - Full Width Row */}
        <TouchableOpacity
          className="bg-dark-800 rounded-2xl p-4 shadow-sm border border-dark-700 mb-3"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-primary-900 rounded-xl p-3 mr-3">
                <Ionicons name="card-outline" size={24} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  Loans
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Borrow & lend crypto assets
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-lg font-bold text-white">$850K</Text>
              <Text className="text-xs text-primary-500 mt-1">+8.2%</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: 12 }}
            />
          </View>
        </TouchableOpacity>

        {/* Auctions - Full Width Row */}
        <TouchableOpacity
          className="bg-dark-800 rounded-2xl p-4 shadow-sm border border-dark-700"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-primary-900 rounded-xl p-3 mr-3">
                <Ionicons name="hammer-outline" size={24} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  Auctions
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  NFT & token auctions
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-lg font-bold text-white">$1.2M</Text>
              <Text className="text-xs text-primary-500 mt-1">+15.3%</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: 12 }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  appKitButtonContainer: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  appKitButton: {
    marginTop: 20,
    backgroundColor: "#16a34a",
  },
});

export default Home;
