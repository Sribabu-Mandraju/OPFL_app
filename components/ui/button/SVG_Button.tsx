import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";

interface SVG_ButtonProps {
  buttonText: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const SVG_Button: React.FC<SVG_ButtonProps> = ({
  buttonText,
  onPress,
  style,
  textStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <ImageBackground
        source={require("@/assets/images/button_bg.png")}
        style={styles.backgroundImage}
        resizeMode="stretch"
      >
        <View style={styles.content}>
          <Text style={[styles.buttonText, textStyle]}>{buttonText}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 12,
  },
  backgroundImage: {
    // width: "100%",
    // height: "100%",
    height: 80,
    // justifyContent: "center",
    // alignItems: "center",
    marginTop: 10,
    transform: [{ translateY: 20 }],
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 200,
    minHeight: 50,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SVG_Button;
