import React, { useState, useRef } from "react";
import { View, RefreshControl, FlatList, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import useFetchAllowedTokens from "@/hooks/tokens/useFetchAllowedTokens";
import {
  useWriteContract,
  useSwitchChain,
  useAccount,
  useChainId,
  usePublicClient,
} from "wagmi";
import { baseSepolia } from "viem/chains";
import FaucetToken_ABI from "@/abis/FaucetToken_ABI.json";
import { FaucetsHeader } from "@/components/faucets/FaucetsHeader";
import { TokenCard } from "@/components/faucets/TokenCard";
import { EmptyState } from "@/components/faucets/EmptyState";
import { LoadingState } from "@/components/faucets/LoadingState";
import { ErrorState } from "@/components/faucets/ErrorState";

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
  const [txHashes, setTxHashes] = useState<{ [key: string]: string }>({});
  const [txStatuses, setTxStatuses] = useState<{
    [key: string]: "idle" | "pending" | "confirming" | "success" | "failed";
  }>({});
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

      // Store transaction hash and set status to pending
      setTxHashes((prev) => ({ ...prev, [tokenAddress]: hash }));
      setTxStatuses((prev) => ({ ...prev, [tokenAddress]: "pending" }));

      // Show transaction sent alert with explorer link
      Alert.alert(
        "Transaction Submitted",
        `Minting 100 ${tokenSymbol}...\n\nTransaction hash:\n${hash.slice(0, 16)}...${hash.slice(-8)}`,
        [
          {
            text: "View on Explorer",
            onPress: () => Linking.openURL(`https://sepolia.basescan.org/tx/${hash}`),
            style: "default",
          },
          { text: "OK" },
        ]
      );

      // Poll for transaction receipt with better reliability
      if (publicClient) {
        // Start polling in the background (non-blocking)
        const pollForReceipt = async () => {
          const maxAttempts = 60; // 60 attempts (2 minutes total)
          const pollInterval = 2000; // 2 seconds between attempts
          let attempts = 0;
          let pollTimeout: ReturnType<typeof setTimeout> | null = null;

          const poll = async (): Promise<void> => {
            try {
              attempts++;
              
              // Try to get the transaction receipt
              const receipt = await publicClient.getTransactionReceipt({ hash });
              
              // Receipt found - transaction confirmed
              if (receipt) {
                // Clear any pending timeout
                if (pollTimeout) clearTimeout(pollTimeout);

                // Update status based on receipt
                const isSuccess = receipt.status === "success";
                setTxStatuses((prev) => ({
                  ...prev,
                  [tokenAddress]: isSuccess ? "success" : "failed",
                }));

                // Reset loading state
                setMinting((prev) => ({ ...prev, [tokenAddress]: false }));

                // Show success/failure alert
                if (isSuccess) {
                  Alert.alert(
                    "Success! 🎉",
                    `You received 100 ${tokenSymbol}!`,
                    [
                      {
                        text: "View Transaction",
                        onPress: () =>
                          Linking.openURL(`https://sepolia.basescan.org/tx/${hash}`),
                      },
                      { text: "OK" },
                    ]
                  );
                } else {
                  Alert.alert(
                    "Transaction Failed",
                    "The transaction was not successful."
                  );
                }
                return; // Exit polling
              }
            } catch (error: any) {
              // Receipt not found yet or other error
              const errorMessage = error?.message || String(error);
              
              if (
                errorMessage.includes("Transaction receipt not found") ||
                errorMessage.includes("not found") ||
                errorMessage.includes("TransactionNotFound")
              ) {
                // Transaction not yet mined, update status to confirming and continue polling
                if (attempts === 1) {
                  setTxStatuses((prev) => ({
                    ...prev,
                    [tokenAddress]: "confirming",
                  }));
                }

                if (attempts < maxAttempts) {
                  pollTimeout = setTimeout(poll, pollInterval);
                } else {
                  // Max attempts reached - reset state but keep hash and status
                  setMinting((prev) => ({ ...prev, [tokenAddress]: false }));
                  setTxStatuses((prev) => ({
                    ...prev,
                    [tokenAddress]: "pending",
                  }));
                  Alert.alert(
                    "Transaction Pending",
                    `Transaction submitted successfully!\n\nIt may take a moment to confirm.\n\nHash: ${hash.slice(0, 16)}...${hash.slice(-8)}`,
                    [
                      {
                        text: "View on Explorer",
                        onPress: () =>
                          Linking.openURL(`https://sepolia.basescan.org/tx/${hash}`),
                      },
                      { text: "OK" },
                    ]
                  );
                }
              } else {
                // Other error - log and continue polling (might be temporary network issue)
                console.error(
                  "Error polling for receipt (attempt",
                  attempts,
                  "):",
                  errorMessage
                );
                if (attempts < maxAttempts) {
                  pollTimeout = setTimeout(poll, pollInterval);
                } else {
                  // Max attempts reached
                  setMinting((prev) => ({ ...prev, [tokenAddress]: false }));
                  setTxStatuses((prev) => ({
                    ...prev,
                    [tokenAddress]: "failed",
                  }));
                }
              }
            }
          };

          // Start polling after a short delay
          pollTimeout = setTimeout(poll, pollInterval);
        };

        // Start polling
        pollForReceipt();
      } else {
        // No public client, just reset state
        setMinting((prev) => ({ ...prev, [tokenAddress]: false }));
      }
    } catch (error: any) {
      console.error("Mint error:", error);
      
      // Reset loading state on error
      setMinting((prev) => ({ ...prev, [tokenAddress]: false }));
      setTxStatuses((prev) => ({
        ...prev,
        [tokenAddress]: "failed",
      }));

      let errorMessage = "Failed to mint tokens";
      if (error.message?.includes('User rejected')) {
        errorMessage = "Transaction was rejected";
      } else if (error.message?.includes('ChainMismatchError')) {
        errorMessage = "Please switch to Base Sepolia network";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const getTokenColor = (symbol: string): [string, string] => {
    const colors: { [key: string]: [string, string] } = {
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
    return <LoadingState />;
  }

  if (error && allowedTokens.length === 0) {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  return (
    <View className="flex-1 bg-dark-950">
      <FaucetsHeader tokenCount={allowedTokens.length} />

      <FlatList
        ref={flatListRef}
        data={allowedTokens}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => {
          const tokenColors = getTokenColor(item.symbol);
          return (
            <TokenCard
              token={item}
              tokenColors={tokenColors}
              onMint={handleMint}
              isMinting={minting[item.address] || false}
              txHash={txHashes[item.address]}
              txStatus={txStatuses[item.address] || "idle"}
            />
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
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

export default Faucets;
