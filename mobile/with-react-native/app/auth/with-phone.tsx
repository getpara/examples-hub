import React, { useState } from "react";
import { SafeAreaView, StyleSheet, ScrollView, View } from "react-native";
import { Input, Button, Text } from "@rneui/themed";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import OTPVerificationComponent from "../../components/OTPVerificationComponent";
import { para } from "../../client/para";
import { RootStackParamList } from "../../types";
import { randomTestPhone } from "../../util/random";

export default function PhoneAuthScreen() {
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhoneNumber] = useState(randomTestPhone());
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleContinue = async () => {
    if (!countryCode || !phone) return;
    setIsLoading(true);
    try {
      const authState = await para.signUpOrLogInV2({ auth: { phone } });

      switch (authState.stage) {
        case "verify":
          setShowOTP(true);
          break;
        case "login":
          await para.login(authState);
          navigation.navigate("Home");
          break;
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  const handleVerify = async (verificationCode: string) => {
    if (!verificationCode) return;
    try {
      const authState = await para.verifyNewAccount({ verificationCode });
      if (authState?.passkeyId) {
        await para.registerPasskey(authState);
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  const resendOTP = async () => {
    await para.resendVerificationCode();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text
            h2
            h2Style={styles.title}>
            {showOTP ? "Enter Verification Code" : "Phone Authentication Demo"}
          </Text>
          <Text style={styles.subtitle}>
            {showOTP
              ? "Enter the code sent to your phone. When using a +1-XXX-555-XXXX test number, a random 6-digit code is auto-filled for rapid testing. For personal numbers, check your phone for the actual code."
              : "Test the Para Auth SDK. A random test number (+1-XXX-555-XXXX) is pre-filled for quick testing with auto-generated codes. Use your phone number instead to test actual SMS delivery. Test users can be managed in your portal's API key section."}
          </Text>
        </View>

        {!showOTP ? (
          <>
            <View style={styles.phoneInputContainer}>
              <Input
                label="Code"
                placeholder="+1"
                value={countryCode}
                onChangeText={setCountryCode}
                keyboardType="phone-pad"
                containerStyle={styles.countryCodeInput}
                inputContainerStyle={styles.input}
              />
              <Input
                label="Number"
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                containerStyle={styles.phoneNumberInput}
                inputContainerStyle={styles.input}
              />
            </View>
            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!countryCode || !phone || isLoading}
              loading={isLoading}
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
            />
          </>
        ) : (
          <OTPVerificationComponent
            onVerify={handleVerify}
            resendOTP={resendOTP}
          />
        )}
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
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "left",
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  countryCodeInput: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 0,
  },
  phoneNumberInput: {
    flex: 3,
    paddingHorizontal: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: "#fc6c58",
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: "100%",
  },
});
