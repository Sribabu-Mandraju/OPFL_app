import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SVG_Button } from "@/components/ui/button";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("hasSeenSplash", "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving splash status:", error);
      router.replace("/(tabs)");
    }
  };

  return (
    <LinearGradient
      colors={["#111827", "#1f2937", "#111827"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        {/* Logo/Icon Section */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet" size={64} color="#16a34a" />
          </View>
          <Text style={styles.title}>OFPL</Text>
          <Text style={styles.subtitle}>Decentralized Finance Platform</Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="water" size={32} color="#16a34a" />
            <Text style={styles.featureText}>Liquidity Pools</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="card" size={32} color="#16a34a" />
            <Text style={styles.featureText}>DeFi Services</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="trending-up" size={32} color="#16a34a" />
            <Text style={styles.featureText}>Portfolio Tracking</Text>
          </View>
        </View>

        {/* Get Started Button */}
        <SVG_Button
          buttonText="Get Started"
          onPress={handleGetStarted}
          style={styles.button}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(22, 163, 74, 0.3)",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 80,
  },
  feature: {
    alignItems: "center",
    flex: 1,
  },
  featureText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  button: {
    width: "100%",
    maxWidth: 300,
    
  },
});
