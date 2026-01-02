import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { TransactionStatus } from "./TransactionStatus";

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface TokenCardProps {
  token: Token;
  tokenColors: [string, string];
  onMint: (
    tokenAddress: string,
    tokenSymbol: string,
    mintAmount: bigint
  ) => void;
  isMinting: boolean;
  txHash?: string;
  txStatus?: "idle" | "pending" | "confirming" | "success" | "failed";
}

export const TokenCard: React.FC<TokenCardProps> = ({
  token,
  tokenColors,
  onMint,
  isMinting,
  txHash,
  txStatus = "idle",
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await Clipboard.setStringAsync(address);
      setCopiedAddress(true);
      setTimeout(() => {
        setCopiedAddress(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const handleMint = () => {
    const mintAmount = BigInt(100 * 10 ** token.decimals);
    onMint(token.address, token.symbol, mintAmount);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.tokenCard}>
        {/* Token Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <LinearGradient
              colors={tokenColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tokenIcon}
            >
              <Text className="text-white font-black text-xl">
                {token.symbol.charAt(0)}
              </Text>
            </LinearGradient>
            <View className="ml-3 flex-1">
              <Text className="text-white text-xl font-bold mb-0.5">
                {token.name}
              </Text>
              <Text className="text-gray-400 text-sm font-semibold">
                {token.symbol}
              </Text>
            </View>
          </View>
          <View className="bg-primary-600/10 px-2.5 py-1 rounded-lg border border-primary-600/20">
            <Text className="text-primary-400 text-xs font-bold">TESTNET</Text>
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
                {truncateAddress(token.address)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleCopyAddress(token.address)}
              activeOpacity={0.7}
              style={styles.copyButton}
            >
              {copiedAddress ? (
                <Ionicons name="checkmark" size={18} color="#16a34a" />
              ) : (
                <Ionicons name="copy-outline" size={18} color="#9ca3af" />
              )}
            </TouchableOpacity>
          </View>
          {copiedAddress && (
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
                <Text className="text-white text-2xl font-black">100</Text>
                <Text className="text-gray-400 text-base font-bold ml-2">
                  {token.symbol}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <TouchableOpacity
                onPress={handleMint}
                disabled={isMinting || txStatus === "confirming"}
                activeOpacity={0.85}
                style={[
                  styles.mintButton,
                  (isMinting || txStatus === "confirming") &&
                    styles.mintButtonDisabled,
                ]}
              >
                <LinearGradient
                  colors={
                    txStatus === "success"
                      ? ["#16a34a", "#15803d"]
                      : txStatus === "failed"
                      ? ["#ef4444", "#dc2626"]
                      : ["#16a34a", "#15803d"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.mintButtonGradient}
                >
                  {isMinting || txStatus === "confirming" ? (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="sync"
                        size={14}
                        color="#ffffff"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-white font-bold text-xs">
                        {txStatus === "confirming"
                          ? "Confirming..."
                          : "Minting..."}
                      </Text>
                    </View>
                  ) : txStatus === "success" ? (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-white font-bold text-xs">
                        Minted
                      </Text>
                    </View>
                  ) : txStatus === "failed" ? (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="close-circle"
                        size={14}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-white font-bold text-xs">
                        Retry
                      </Text>
                    </View>
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
              <TransactionStatus
                status={txStatus}
                txHash={txHash}
                tokenSymbol={token.symbol}
              />
            </View>
          </View>
        </View>
      </View>
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
    marginHorizontal: 20,
    marginBottom: 16,
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
});
