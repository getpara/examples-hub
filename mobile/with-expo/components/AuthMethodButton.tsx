import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "@rneui/themed";
import { MaterialIcons } from "@expo/vector-icons";

interface AuthMethodButtonProps {
  type: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  testID?: string;
}

const AuthMethodButton: React.FC<AuthMethodButtonProps> = ({ type, title, description, icon, onPress, testID }) => {
  return (
    <Button
      onPress={onPress}
      buttonStyle={styles.button}
      containerStyle={styles.buttonContainer}
      testID={testID || `auth-method-${type}`}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${title} authentication method`}>
      <View style={styles.content}>
        <MaterialIcons
          name={icon}
          size={24}
          color="#fc6c58"
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color="#888"
          style={styles.chevron}
        />
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  icon: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    letterSpacing: 0.1,
  },
  description: {
    fontSize: 14,
    color: "#666666",
  },
  chevron: {
    marginLeft: 12,
  },
});

export default AuthMethodButton;
