import { Header } from "@/components/NavigationHeader";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
      }}>
      <Stack.Screen
        name="index"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="otp-verification"
        options={{
          headerShown: true,
          gestureEnabled: false,
          header: (props) => <Header {...props} />,
        }}
      />
      <Stack.Screen
        name="account-setup"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
