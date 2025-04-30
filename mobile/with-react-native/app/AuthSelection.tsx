import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Text } from "@rneui/themed";
import AuthMethodButton from "../components/AuthMethodButton";
import { RootStackParamList } from "../types";

const authMethods = [
  {
    type: "email",
    title: "Email Authentication",
    description: "Test email-based authentication flow",
    icon: "mail",
    route: "EmailAuth",
  },
  {
    type: "phone",
    title: "Phone Authentication",
    description: "Test phone number-based authentication flow",
    icon: "phone",
    route: "PhoneAuth",
  },
  {
    type: "oauth",
    title: "OAuth Authentication",
    description: "Test OAuth-based authentication flow",
    icon: "lock",
    route: "OauthAuth",
  },
] as const;

export default function AuthSelectionScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text
            h2
            h2Style={styles.title}>
            Para Auth SDK Demo
          </Text>
          <Text style={styles.subtitle}>
            Test user authentication via email or phone. Upon first authentication, a passkey is created to secure the
            user's wallets. This passkey becomes their primary authentication method for future logins. Explore our
            documentation at docs.getpara.com for implementation details.
          </Text>
        </View>

        <View style={styles.buttonList}>
          {authMethods.map((method) => (
            <AuthMethodButton
              key={method.type}
              type={method.type}
              title={method.title}
              description={method.description}
              icon={method.icon}
              onPress={() => navigation.navigate(method.route)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    color: "#333333",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 32,
  },
  subtitle: {
    textAlign: "left",
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },
  buttonList: {
    // you could add alignItems or justifyContent if you want a certain layout
  },
  buttonWrapper: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    // Optional shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // For Android shadow
    elevation: 2,
    overflow: "hidden",
  },
});
