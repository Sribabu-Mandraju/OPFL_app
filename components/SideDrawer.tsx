import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const translateX = useSharedValue(-300);
  const overlayOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateX.value = withTiming(-300, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  const menuItems = [
    { icon: "home-outline", label: "Home", onPress: () => {} },
    { icon: "person-outline", label: "Profile", onPress: () => {} },
    { icon: "settings-outline", label: "Settings", onPress: () => {} },
    { icon: "help-circle-outline", label: "Help", onPress: () => {} },
    { icon: "log-out-outline", label: "Logout", onPress: () => {} },
  ];

  if (!isOpen && translateX.value === -300) return null;

  return (
    <>
      <Animated.View
        style={[
          overlayStyle,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000000",
            zIndex: 30,
          },
        ]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable onPress={onClose} className="flex-1" style={{ flex: 1 }} />
      </Animated.View>

      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 288,
            backgroundColor: "#1f2937",
            zIndex: 40,
            shadowColor: "#000",
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10,
          },
        ]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <View className="flex-1 pt-16 px-4 bg-dark-800">
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-2xl font-bold text-primary-500">Menu</Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#16a34a" />
            </TouchableOpacity>
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                item.onPress();
                onClose();
              }}
              className="flex-row items-center py-4 px-3 mb-2 rounded-lg active:bg-dark-700"
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon as any} size={24} color="#16a34a" />
              <Text className="ml-4 text-base text-gray-200 font-medium">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
};

export default SideDrawer;
