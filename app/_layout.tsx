import "../global.css";
import "text-encoding";
import "@walletconnect/react-native-compat";
import {
  AppKit,
  AppKitProvider,
  createAppKit,
} from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia } from "@wagmi/core/chains";
import { WagmiProvider } from "wagmi";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import * as Clipboard from "expo-clipboard";

import { useColorScheme } from "@/hooks/useColorScheme";
import { storage } from "@/utils/StorageUtil";
import { View, ActivityIndicator } from "react-native";
import { DrawerProvider } from "@/contexts/DrawerContext";

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setStringAsync(value);
  },
};

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://dashboard.reown.com
const projectId = "ca703cec4e1cc82b7e8a1342fed93c90"; // This project ID will only work for Expo Go. Use your own project ID for production.

// 2. Create config
const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
    universal: "YOUR_APP_UNIVERSAL_LINK.com",
  },
};

// Configure only Base Sepolia network
const networks = [baseSepolia];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: networks as any,
});

// 3. Create modal - only Base Sepolia network
const appkit = createAppKit({
  projectId,
  networks: networks,
  adapters: [wagmiAdapter],
  metadata,
  clipboardClient,
  storage,
  defaultNetwork: baseSepolia, // Set Base Sepolia as default
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    KHTeka: require("../assets/fonts/KHTeka-Regular.otf"),
    KHTekaMedium: require("../assets/fonts/KHTeka-Medium.otf"),
    KHTekaMono: require("../assets/fonts/KHTekaMono-Regular.otf"),
  });

  if (!loaded) {
    // Show loading screen while fonts are loading
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#111827",
        }}
      >
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider instance={appkit}>
            <DrawerProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="splash" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
              {/* This is a workaround for the Android modal issue. https://github.com/expo/expo/issues/32991#issuecomment-2489620459 */}
              <View
                style={{ position: "absolute", height: "100%", width: "100%" }}
              >
                <AppKit />
              </View>
            </DrawerProvider>
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
