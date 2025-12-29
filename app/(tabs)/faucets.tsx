import React, { useState, useRef } from "react";
import {
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import useFetchAllowedTokens from "@/hooks/tokens/useFetchAllowedTokens";
import {
  useWriteContract,
  useSwitchChain,
  useAccount,
  useChainId,
  usePublicClient,
} from 'wagmi';
import { baseSepolia } from 'viem/chains';
import FaucetToken_ABI from '@/abis/FaucetToken_ABI.json';
import { Alert, Linking } from "react-native";

const Faucets = () => {
  const { switchChainAsync } = useSwitchChain();
  const currentChainId = useChainId();
  const { address: userAddress, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const {
    allowedTokens,
    loading,
    error,
    refreshing,
    refresh,
  } = useFetchAllowedTokens();
  const insets = useSafeAreaInsets();

  const [minting, setMinting] = useState<{ [key: string]: boolean }>({});
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Calculate tab bar height: 72 + insets.bottom + 8 (padding)
  const tabBarHeight = 72 + insets.bottom + 8;

  // Reset scroll position to top when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  const handleMint = async (tokenAddress: string, tokenSymbol: string, mintAmount: bigint) => {
    if(!isConnected || !userAddress) {
      Alert.alert('Please connect your wallet to mint tokens');
      return;
    }

    setMinting((prev) => ({ ...prev, [tokenAddress]: true }));

    try {
      if (currentChainId !== baseSepolia.id) {
        await switchChainAsync({ chainId: baseSepolia.id });
      }

      const hash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: FaucetToken_ABI,
        functionName: 'mint',
        args: [userAddress, mintAmount],
      });

      // Reset loading state immediately after transaction is sent
      setMinting((prev) => ({ ...prev, [tokenAddress]: false }));

      // Show transaction sent alert
      Alert.alert(
        "Transaction Sent", 
        `Minting 100 ${tokenSymbol}...\nHash: ${hash.slice(0, 10)}...`, 
        [
          { 
            text: "View on Explorer", 
            onPress: () => Linking.openURL(`https://sepolia.basescan.org/tx/${hash}`) 
          },
          { text: "OK" },
        ]
      );

      // Wait for transaction receipt in the background (non-blocking)
      if (publicClient) {
        // Use Promise.race with timeout to prevent hanging
        Promise.race([
          publicClient.waitForTransactionReceipt({ hash }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 60000) // 60 second timeout
          )
        ])
        .then((receipt: any) => {
          if (receipt.status === "success") {
            Alert.alert("Success! 🎉", `You received 100 ${tokenSymbol}!`);
          } else {
            Alert.alert("Transaction Failed", "The transaction was not successful.");
          }
        })
        .catch((receiptError) => {
          console.error("Error waiting for receipt:", receiptError);
          // Don't show error alert if it's just a timeout - transaction was already sent
          if (!receiptError.message?.includes('Timeout')) {
            console.log("Transaction submitted. Check explorer for confirmation.");
          }
        });
      }
    } catch (error) {
      console.error("Mint error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to mint tokens";
      Alert.alert("Error", errorMessage);
      // Reset loading state on error
      setMinting((prev) => ({ ...prev, [tokenAddress]: false }));
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await Clipboard.setStringAsync(address);
      setCopiedAddress(address);
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedAddress(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const getTokenColor = (symbol: string) => {
    const colors: { [key: string]: string[] } = {
      WETH: ["#627EEA", "#4C6CD4"],
      USDC: ["#2775CA", "#1E5AA8"],
      USDT: ["#26A17B", "#1E8A6A"],
      DAI: ["#F5AC37", "#E09A2E"],
      WBTC: ["#F7931A", "#E08416"],
      LINK: ["#2E5AA8", "#1E4A88"],
      UNI: ["#FF007A", "#E0006A"],
      AAVE: ["#B6509E", "#9E4088"],
      MKR: ["#1AAB9B", "#158B7D"],
      SHIB: ["#F00500", "#D00400"],
    };
    return colors[symbol] || ["#16a34a", "#15803d"];
  };

  if (loading && allowedTokens.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-950">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (error && allowedTokens.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-950 px-4">
        <View className="bg-dark-800 rounded-2xl p-6 border border-red-500/20">
          <Text className="text-red-400 text-center text-base font-semibold mb-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refresh}
            style={styles.retryButton}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-950">
      {/* Header */}
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
              {allowedTokens.length} Tokens Available
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={allowedTokens}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => {
          const [colorStart, colorEnd] = getTokenColor(item.symbol);
          return (
            <View style={styles.cardContainer} className="mx-5 mb-4">
              <View style={styles.tokenCard}>
                {/* Token Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    <LinearGradient
                      colors={[colorStart, colorEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tokenIcon}
                    >
                      <Text className="text-white font-black text-xl">
                        {item.symbol.charAt(0)}
                      </Text>
                    </LinearGradient>
                    <View className="ml-3 flex-1">
                      <Text className="text-white text-xl font-bold mb-0.5">
                        {item.name}
                      </Text>
                      <Text className="text-gray-400 text-sm font-semibold">
                        {item.symbol}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-primary-600/10 px-2.5 py-1 rounded-lg border border-primary-600/20">
                    <Text className="text-primary-400 text-xs font-bold">
                      TESTNET
                    </Text>
                  </View>
                </View>

                {/* Address */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs font-medium mb-1.5">
                    Contract Address
                  </Text>
                  <View className="flex-row items-center">
                    <View className="flex-1 bg-dark-900/50 px-3 py-2.5 rounded-lg border border-dark-700/50">
                      <Text className="text-gray-300 text-xs font-mono">
                        {truncateAddress(item.address)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCopyAddress(item.address)}
                      activeOpacity={0.7}
                      style={styles.copyButton}
                    >
                      {copiedAddress === item.address ? (
                        <Ionicons name="checkmark" size={18} color="#16a34a" />
                      ) : (
                        <Ionicons
                          name="copy-outline"
                          size={18}
                          color="#9ca3af"
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  {copiedAddress === item.address && (
                    <Text className="text-primary-500 text-xs font-medium mt-1.5 ml-1">
                      Address copied!
                    </Text>
                  )}
                </View>

                {/* Mint Section */}
                <View className="pt-4 border-t border-dark-700/50">
                  <View className="flex-row items-end justify-between">
                    <View className="flex-1">
                      <Text className="text-gray-400 text-xs font-medium mb-1.5">
                        Mint Amount
                      </Text>
                      <View className="flex-row items-baseline">
                        <Text className="text-white text-2xl font-black">
                          100
                        </Text>
                        <Text className="text-gray-400 text-base font-bold ml-2">
                          {item.symbol}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleMint(item.address, item.symbol, BigInt(100 * 10 ** item.decimals))}
                      disabled={minting[item.address]}
                      activeOpacity={0.85}
                      style={[
                        styles.mintButton,
                        minting[item.address] && styles.mintButtonDisabled,
                      ]}
                    >
                      <LinearGradient
                        colors={["#16a34a", "#15803d"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.mintButtonGradient}
                        
                      >
                        {minting[item.address] ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <View className="flex-row items-center">
                            <Text className="text-white font-black text-sm mr-1.5">
                              Mint
                            </Text>
                            <Text className="text-white/80 text-xs">→</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 24,
          paddingTop: 4,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#16a34a"
            colors={["#16a34a"]}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-4">
            <View className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
              <Text className="text-gray-400 text-center text-base">
                No tokens available
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tokenCard: {
    backgroundColor: "#1f2937",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.3)",
  },
  tokenIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mintButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#16a34a",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mintButtonGradient: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  mintButtonDisabled: {
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  copyButton: {
    marginLeft: 8,
    padding: 10,
    backgroundColor: "#111827",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Faucets;
