import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SideDrawer from "../../components/SideDrawer";
import TabsHeader from "../../components/TabsHeader";
import { useDrawer } from "../../contexts/DrawerContext";

export default function TabsLayout() {
  const { isOpen, closeDrawer } = useDrawer();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          header: () => <TabsHeader />,
          tabBarActiveTintColor: "#16a34a",
          tabBarInactiveTintColor: "#6b7280",
          tabBarStyle: {
            ...styles.tabBar,
            height: 72 + insets.bottom,
            paddingBottom: insets.bottom + 8,
            paddingTop: 12,
          },
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIconStyle: styles.tabBarIcon,
          tabBarItemStyle: styles.tabBarItem,
          tabBarBackground: () => <View style={styles.tabBarBackground} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused, size }) => (
              <View style={focused ? styles.activeIconContainer : null}>
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={focused ? 26 : 24}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="pools"
          options={{
            title: "Pools",
            tabBarIcon: ({ color, focused, size }) => (
              <View style={focused ? styles.activeIconContainer : null}>
                <Ionicons
                  name={focused ? "water" : "water-outline"}
                  size={focused ? 26 : 24}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="faucets"
          options={{
            title: "Faucets",
            tabBarIcon: ({ color, focused, size }) => (
              <View style={focused ? styles.activeIconContainer : null}>
                <Ionicons
                  name={focused ? "flash" : "flash-outline"}
                  size={focused ? 26 : 24}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: "Portfolio",
            tabBarIcon: ({ color, focused, size }) => (
              <View style={focused ? styles.activeIconContainer : null}>
                <Ionicons
                  name={focused ? "briefcase" : "briefcase-outline"}
                  size={focused ? 26 : 24}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color, focused, size }) => (
              <View style={focused ? styles.activeIconContainer : null}>
                <Ionicons
                  name={focused ? "heart" : "heart-outline"}
                  size={focused ? 26 : 24}
                  color={color}
                />
              </View>
            ),
          }}
        />
      </Tabs>
      <SideDrawer isOpen={isOpen} onClose={closeDrawer} />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#111827",
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "rgba(75, 85, 99, 0.2)",
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  tabBarIcon: {
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  activeIconContainer: {
    backgroundColor: "rgba(22, 163, 74, 0.15)",
    borderRadius: 12,
    padding: 6,
    marginBottom: 2,
  },
});
