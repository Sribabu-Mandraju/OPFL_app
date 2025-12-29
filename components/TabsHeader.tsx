import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrawer } from "../contexts/DrawerContext";
import { WalletInfoView } from "./WalletInfoView";
import { AppKitButton, useAppKit } from "@reown/appkit-react-native";
import { useWalletInfo } from "@reown/appkit-react-native";

const TabsHeader = () => {
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const { walletInfo } = useWalletInfo();
  const { open } = useAppKit();
  const isConnected = !!walletInfo;

  return (
    <View className="bg-dark-950" style={{ paddingTop: insets.top }}>
      <View style={styles.headerContainer}>
        {/* Left Section - Menu */}
        <TouchableOpacity
          onPress={openDrawer}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={22} color="#ffffff" />
        </TouchableOpacity>

        {/* Center Section - Logo/Title */}
        <View style={styles.centerSection}>
          <View className="flex-row items-center">
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#16a34a", "#15803d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Ionicons name="flash" size={18} color="#ffffff" />
              </LinearGradient>
            </View>
            <Text style={styles.appTitle}>OFPL</Text>
          </View>
        </View>

        {/* Right Section - Wallet */}
        <View style={styles.walletSection}>
          {isConnected ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => open()}
              style={styles.connectedWalletButton}
            >
              <View style={styles.connectedWallet}>
                <WalletInfoView />
                <View style={styles.walletBadge}>
                  <View style={styles.walletDot} />
                  <Text style={styles.walletText}>Connected</Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color="#9ca3af"
                  style={styles.chevronIcon}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <AppKitButton connectStyle={styles.connectButton} label="Connect" />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(75, 85, 99, 0.2)",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginRight: 8,
  },
  logoGradient: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  walletSection: {
    alignItems: "flex-end",
  },
  connectedWalletButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(75, 85, 99, 0.3)",
  },
  connectedWallet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  walletBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(22, 163, 74, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(22, 163, 74, 0.3)",
  },
  walletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a34a",
    marginRight: 6,
  },
  walletText: {
    color: "#16a34a",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  connectButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minHeight: 40,
    shadowColor: "#16a34a",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default TabsHeader;
