import { useEffect, useState, useCallback } from "react";

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isAllowed: boolean;
}

const BASE_URL = "https://ofpl-backend-xlog.onrender.com";

export default function useFetchAllowedTokens() {
  const [allowedTokens, setAllowedTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllowedTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Remove trailing slash from BASE_URL if present
      const baseUrl = BASE_URL?.endsWith("/")
        ? BASE_URL.slice(0, -1)
        : BASE_URL;
      const url = `${baseUrl}/tokens/get-allowed-tokens`;
      console.log("Fetching from:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch allowed tokens: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data type:", Array.isArray(data) ? "Array" : typeof data);
      console.log("Data length:", Array.isArray(data) ? data.length : "N/A");

      // Handle case where data might be wrapped in an object
      // API returns: { "allowedTokens": [...] }
      const rawTokens = Array.isArray(data)
        ? data
        : data.allowedTokens || data.tokens || data.data || [];

      // Map API response fields to match our interface
      // API returns: tokenAddress, tokenName, tokenSymbol, tokenDecimals
      // We need: address, name, symbol, decimals
      const tokens: Token[] = rawTokens.map((token: any) => ({
        address: token.tokenAddress || token.address,
        name: token.tokenName || token.name,
        symbol: token.tokenSymbol || token.symbol,
        decimals: token.tokenDecimals || token.decimals,
        isAllowed: token.isAllowed !== undefined ? token.isAllowed : true,
      }));

      console.log("Tokens to set:", tokens.length);
      // console.log("Mapped tokens:", JSON.stringify(tokens, null, 2));

      setAllowedTokens(tokens);
    } catch (error) {
      console.error("Fetch error details:", error);
      let errorMessage = "An error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Provide more specific error messages
      if (
        errorMessage.includes("Network request failed") ||
        errorMessage.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network error: Unable to connect to the server. Please check your connection.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllowedTokens();
  }, [fetchAllowedTokens]);

  useEffect(() => {
    if (refreshing) {
      fetchAllowedTokens();
    }
  }, [refreshing, fetchAllowedTokens]);

  return {
    allowedTokens,
    loading,
    error,
    refreshing,
    refresh: () => setRefreshing(true),
  };
}
