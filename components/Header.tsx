import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface HeaderProps {
  onMenuPress: () => void;
  onProfilePress: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress, onProfilePress }) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700 shadow-sm">
      <TouchableOpacity
        onPress={onMenuPress}
        className="p-2 rounded-full active:bg-dark-700"
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={24} color="#16a34a" />
      </TouchableOpacity>

      <View className="flex-1" />

      <TouchableOpacity
        onPress={onProfilePress}
        className="p-2 rounded-full bg-primary-900 active:bg-primary-800"
        activeOpacity={0.7}
      >
        <Ionicons name="person" size={20} color="#16a34a" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
