import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean | null>(null);

  useEffect(() => {
    checkSplashStatus();
  }, []);

  const checkSplashStatus = async () => {
    try {
      const value = await AsyncStorage.getItem("hasSeenSplash");
      setHasSeenSplash(value === "true");
    } catch (error) {
      console.error("Error checking splash status:", error);
      setHasSeenSplash(false);
    }
  };

  if (hasSeenSplash === null) {
    return null; // Loading state
  }

  if (hasSeenSplash) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/splash" />;
}
