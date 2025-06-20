import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { EmailAuth } from "./EmailAuth";
import { PhoneAuth } from "./PhoneAuth";
import { OAuthAuth } from "./OAuthAuth";

interface AuthSectionProps {
  onSuccess: () => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({ onSuccess }) => {
  // Toggle between email and phone auth methods
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  // Controls visibility of OTP verification screen
  const [showVerification, setShowVerification] = useState(false);
  // Controls visibility of security choice screen
  const [showSecurityChoice, setShowSecurityChoice] = useState(false);

  const handleShowVerification = () => {
    setShowVerification(true);
  };

  const handleHideVerification = () => {
    setShowVerification(false);
  };

  const handleShowSecurityChoice = () => {
    setShowSecurityChoice(true);
  };

  const handleHideSecurityChoice = () => {
    setShowSecurityChoice(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled">
        
        {!showSecurityChoice && (
          <>
            <Text style={styles.title}>Para SDK Demo</Text>
            <Text style={styles.subtitle}>Sign in or create an account</Text>
          </>
        )}

        {!showVerification && !showSecurityChoice && (
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, authMethod === "email" && styles.activeTab]}
              onPress={() => setAuthMethod("email")}>
              <Text style={[styles.tabText, authMethod === "email" && styles.activeTabText]}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, authMethod === "phone" && styles.activeTab]}
              onPress={() => setAuthMethod("phone")}>
              <Text style={[styles.tabText, authMethod === "phone" && styles.activeTabText]}>Phone</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Render selected auth method component */}
        {authMethod === "email" ? 
          <EmailAuth 
            onSuccess={onSuccess} 
            onShowVerification={handleShowVerification} 
            onHideVerification={handleHideVerification}
            onShowSecurityChoice={handleShowSecurityChoice}
            onHideSecurityChoice={handleHideSecurityChoice}
          /> : 
          <PhoneAuth 
            onSuccess={onSuccess} 
            onShowVerification={handleShowVerification} 
            onHideVerification={handleHideVerification}
            onShowSecurityChoice={handleShowSecurityChoice}
            onHideSecurityChoice={handleHideSecurityChoice}
          />
        }

        {!showVerification && !showSecurityChoice && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth providers section */}
            <View style={styles.oauthSection}>
              <OAuthAuth 
                onSuccess={onSuccess} 
                onShowSecurityChoice={handleShowSecurityChoice}
                onHideSecurityChoice={handleHideSecurityChoice}
              />
            </View>

            <View style={styles.testInfo}>
              <Text style={styles.testTitle}>Beta Testing Instructions</Text>
              <Text style={styles.testSubtitle}>Email Testing</Text>
              <Text style={styles.testText}>
                • Use any <Text style={styles.bold}>@usecapsule.com</Text> or <Text style={styles.bold}>@getpara.com</Text> email
              </Text>
              <Text style={styles.testText}>• Example: test@usecapsule.com</Text>
              <Text style={styles.testText}>
                • <Text style={styles.bold}>Any random OTP will work</Text> (no email sent)
              </Text>
              
              <Text style={[styles.testSubtitle, { marginTop: 16 }]}>Phone Testing</Text>
              <Text style={styles.testText}>
                • Use format: <Text style={styles.bold}>+1 (XXX) 555-XXXX</Text>
              </Text>
              <Text style={styles.testText}>• Area code: Any valid US area code</Text>
              <Text style={styles.testText}>• Example: +1 (425) 555-1234</Text>
              <Text style={styles.testText}>
                • <Text style={styles.bold}>Any random OTP will work</Text> (no SMS sent)
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
  },
  oauthSection: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#999999",
    fontWeight: "500",
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
  },
  tabText: {
    fontSize: 16,
    color: "#999999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000000",
    fontWeight: "600",
  },
  testInfo: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000000",
  },
  testSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000000",
  },
  testText: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 6,
    marginLeft: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "700",
    color: "#000000",
  },
});