import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";

const { width } = Dimensions.get("window");

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}

interface CryptoChartProps {
  symbol: string;
  timeframe: string;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ symbol, timeframe }) => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const candlesRef = useRef<CandleData[]>([]);
  const initialPriceRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const currentSymbolRef = useRef<string>(symbol); // Track current symbol to prevent stale updates
  const updateThrottle = 500; // Throttle updates to every 500ms

  const chartHeight = 220;
  const chartWidth = width - 64;
  const maxCandles = 100;

  // Map timeframe to Binance interval
  const getBinanceInterval = (tf: string): string => {
    switch (tf) {
      case "Today":
        return "1h";
      case "Week":
        return "4h";
      case "Month":
        return "1d";
      case "0.5 Year":
        return "1w";
      case "Year":
        return "1M";
      default:
        return "1h";
    }
  };

  // Fetch historical OHLC data from Binance
  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoading(true);
      // Reset state when fetching new data
      setCandles([]);
      setCurrentPrice(null);
      setPriceChange(0);
      candlesRef.current = [];
      initialPriceRef.current = null;

      // Update current symbol ref
      currentSymbolRef.current = symbol;

      const interval = getBinanceInterval(timeframe);
      const limit = 100;

      // Convert symbol to Binance format (e.g., ETH -> ETHUSDT)
      const binanceSymbol = symbol.toUpperCase() + "USDT";

      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.msg || `Failed to fetch data: ${response.status}`
        );
      }

      const data = await response.json();

      // Validate response is an array
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid data format from API");
      }

      // Validate and format candles
      const formattedCandles: CandleData[] = data
        .map((candle: any[]) => {
          if (!Array.isArray(candle) || candle.length < 5) {
            return null;
          }
          const open = parseFloat(candle[1]);
          const high = parseFloat(candle[2]);
          const low = parseFloat(candle[3]);
          const close = parseFloat(candle[4]);
          const timestamp = parseInt(candle[0]);

          // Validate all values are valid numbers
          if (
            isNaN(open) ||
            isNaN(high) ||
            isNaN(low) ||
            isNaN(close) ||
            isNaN(timestamp) ||
            open <= 0 ||
            high <= 0 ||
            low <= 0 ||
            close <= 0
          ) {
            return null;
          }

          // Validate OHLC logic (high >= open/close >= low)
          if (high < Math.max(open, close) || low > Math.min(open, close)) {
            return null;
          }

          return {
            open,
            high,
            low,
            close,
            timestamp,
          };
        })
        .filter((candle): candle is CandleData => candle !== null);

      if (formattedCandles.length === 0) {
        throw new Error("No valid candles found in response");
      }

      candlesRef.current = formattedCandles;
      setCandles(formattedCandles);

      if (formattedCandles.length > 0) {
        // Only update if this is still the current symbol (prevent race conditions)
        if (currentSymbolRef.current === symbol) {
          const latest = formattedCandles[formattedCandles.length - 1];
          const first = formattedCandles[0];
          setCurrentPrice(latest.close);
          initialPriceRef.current = first.open;
          setPriceChange(((latest.close - first.open) / first.open) * 100);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setLoading(false);
      // Don't use fallback data - show error state instead
      // This prevents showing wrong prices
      setCandles([]);
      setCurrentPrice(null);
      setPriceChange(0);
    }
  }, [symbol, timeframe]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    // Close existing WebSocket if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Update current symbol ref
    currentSymbolRef.current = symbol;

    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;
    const currentSymbol = symbol; // Capture symbol for this effect

    const connectWebSocket = () => {
      if (!isMounted) return;

      // Double-check symbol hasn't changed
      if (currentSymbolRef.current !== currentSymbol) {
        console.log("Symbol changed, aborting WebSocket connection");
        return;
      }

      try {
        // Binance WebSocket requires lowercase symbols
        const binanceSymbol = currentSymbol.toLowerCase() + "usdt";
        // Use ticker stream for real-time price updates
        const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@ticker`;

        // Check if WebSocket is available (may not be in Expo Go)
        if (typeof WebSocket === "undefined") {
          console.warn("WebSocket is not available in this environment");
          return;
        }

        let ws: WebSocket;
        try {
          ws = new WebSocket(wsUrl);
        } catch (error) {
          console.error("Failed to create WebSocket connection:", error);
          return;
        }

        ws.onopen = () => {
          if (isMounted && currentSymbolRef.current === currentSymbol) {
            console.log("WebSocket connected for", currentSymbol);
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;

          // Verify this message is for the current symbol
          if (currentSymbolRef.current !== currentSymbol) {
            console.log("Ignoring WebSocket message for old symbol");
            return;
          }

          try {
            const now = Date.now();
            // Throttle updates to prevent excessive re-renders
            if (now - lastUpdateTimeRef.current < updateThrottle) {
              return;
            }
            lastUpdateTimeRef.current = now;

            const data = JSON.parse(event.data);

            // Validate WebSocket data structure
            if (!data || typeof data !== "object" || !data.c) {
              console.warn("Invalid WebSocket data structure:", data);
              return;
            }

            const price = parseFloat(data.c);

            // Final check: ensure symbol still matches
            if (currentSymbolRef.current !== currentSymbol) {
              return;
            }

            // Validate price is a valid number and within reasonable range
            if (
              isNaN(price) ||
              price <= 0 ||
              !isFinite(price) ||
              candlesRef.current.length === 0 ||
              initialPriceRef.current === null ||
              currentSymbolRef.current !== currentSymbol
            ) {
              if (currentSymbolRef.current !== currentSymbol) {
                console.log("Symbol changed during price update, ignoring");
              }
              return;
            }

            const latest = candlesRef.current[candlesRef.current.length - 1];

            // Only update if price is significantly different to avoid micro-fluctuations
            // Use percentage change threshold for better accuracy across different price ranges
            const priceChangePercent =
              Math.abs((price - latest.close) / latest.close) * 100;
            const shouldUpdate =
              priceChangePercent > 0.01 ||
              Math.abs(price - latest.close) > 0.01;

            // Always update current price display
            setCurrentPrice(price);

            if (shouldUpdate) {
              // Only update the latest candle's close price
              const updatedCandles = [...candlesRef.current];
              updatedCandles[updatedCandles.length - 1] = {
                ...latest,
                close: price,
                // Only update high/low if price exceeds current range
                high: price > latest.high ? price : latest.high,
                low: price < latest.low ? price : latest.low,
              };

              candlesRef.current = updatedCandles;
              setCandles(updatedCandles);
            }

            // Always recalculate price change from initial price
            if (initialPriceRef.current !== null) {
              setPriceChange(
                ((price - initialPriceRef.current) / initialPriceRef.current) *
                  100
              );
            }
          } catch (error) {
            console.error("Error parsing WebSocket data:", error);
          }
        };

        ws.onerror = (error) => {
          if (isMounted) {
            console.error("WebSocket error:", error);
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            console.log("WebSocket closed, reconnecting...");
            // Reconnect after 3 seconds
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("Error setting up WebSocket:", error);
      }
    };

    // Only connect if we have candles loaded and symbol matches
    // Use a small delay to ensure data is loaded
    let connectTimer: ReturnType<typeof setTimeout> | null = null;

    const tryConnect = () => {
      if (
        isMounted &&
        candlesRef.current.length > 0 &&
        currentSymbolRef.current === currentSymbol
      ) {
        connectWebSocket();
      } else if (isMounted && currentSymbolRef.current === currentSymbol) {
        // Retry after a short delay if candles aren't loaded yet
        connectTimer = setTimeout(tryConnect, 200);
      }
    };

    // Start trying to connect
    tryConnect();

    // Cleanup on unmount or when symbol changes
    return () => {
      isMounted = false;
      if (connectTimer) {
        clearTimeout(connectTimer);
        connectTimer = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol]);

  // Fetch historical data when symbol or timeframe changes
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  // Render candlestick chart
  const renderChart = () => {
    if (candles.length === 0) return null;

    // Calculate min/max with some padding for better visualization
    const values = candles.flatMap((c) => [c.high, c.low, c.open, c.close]);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const padding = (maxValue - minValue) * 0.1; // 10% padding
    const adjustedMax = maxValue + padding;
    const adjustedMin = Math.max(0, minValue - padding);
    const valueRange = adjustedMax - adjustedMin || 1;

    const chartAreaHeight = chartHeight - 60;
    const candleWidth = (chartWidth - 40) / Math.max(candles.length, 1);
    const spacing = Math.max(candleWidth * 0.1, 2);
    const actualCandleWidth = Math.max(candleWidth - spacing, 4);

    const normalize = (val: number) => {
      const normalized = ((val - adjustedMin) / valueRange) * chartAreaHeight;
      return Math.max(
        0,
        Math.min(chartAreaHeight, chartAreaHeight - normalized)
      );
    };

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {candles.map((candle, index) => {
          const isGreen = candle.close >= candle.open;
          const bodyTop = Math.max(candle.open, candle.close);
          const bodyBottom = Math.min(candle.open, candle.close);

          const x = index * candleWidth + 20;
          const wickTop = normalize(candle.high);
          const wickBottom = normalize(candle.low);
          const bodyTopPos = normalize(bodyTop);
          const bodyBottomPos = normalize(bodyBottom);
          const bodyHeight = Math.max(Math.abs(bodyTopPos - bodyBottomPos), 1);

          return (
            <React.Fragment key={index}>
              {/* Wick */}
              <Line
                x1={x + actualCandleWidth / 2}
                y1={wickTop}
                x2={x + actualCandleWidth / 2}
                y2={wickBottom}
                stroke={isGreen ? "#16a34a" : "#ef4444"}
                strokeWidth="2"
              />
              {/* Body */}
              <Rect
                x={x + spacing / 2}
                y={Math.min(bodyTopPos, bodyBottomPos)}
                width={actualCandleWidth}
                height={Math.max(bodyHeight, 2)}
                fill={isGreen ? "#16a34a" : "#ef4444"}
                rx="2"
              />
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  if (loading && candles.length === 0) {
    return (
      <View
        className="bg-dark-800 rounded-2xl p-4 shadow-sm items-center justify-center border border-dark-700"
        style={{ height: chartHeight + 100 }}
      >
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-400 mt-4">Loading chart data...</Text>
      </View>
    );
  }

  return (
    <View className="bg-dark-800 rounded-2xl p-4 shadow-sm border border-dark-700">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-sm text-gray-400 mb-1">Available balance</Text>
          <Text className="text-3xl font-bold text-white">
            {currentPrice
              ? `$${currentPrice.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "Loading..."}
          </Text>
        </View>
        <View className="bg-dark-700 rounded-lg px-3 py-2 flex-row items-center border border-dark-600">
          <Ionicons
            name={priceChange >= 0 ? "trending-up" : "trending-down"}
            size={16}
            color={priceChange >= 0 ? "#16a34a" : "#ef4444"}
          />
          <Text
            className={`font-semibold ml-1 ${
              priceChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={{ height: chartHeight, marginVertical: 8 }}>
        {/* Y-axis labels */}
        <View className="flex-row" style={{ height: chartHeight - 30 }}>
          <View className="w-10 items-end pr-2 justify-between">
            {[0, 1, 2, 3, 4].map((val) => {
              if (candles.length === 0) return null;
              const maxVal = Math.max(...candles.map((c) => c.high));
              const minVal = Math.min(...candles.map((c) => c.low));
              const range = maxVal - minVal;
              const label = minVal + (range / 4) * val;
              return (
                <Text key={val} className="text-xs text-gray-400">
                  {label > 1000
                    ? `${(label / 1000).toFixed(1)}k`
                    : label.toFixed(0)}
                </Text>
              );
            })}
          </View>

          {/* Chart area */}
          <View className="flex-1" style={{ height: chartHeight - 40 }}>
            {renderChart()}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CryptoChart;
