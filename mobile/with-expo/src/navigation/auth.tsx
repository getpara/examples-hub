import { Stack } from "expo-router";
import { Header } from "@/components/NavigationHeader";

export function AuthNavigation() {
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
        name="otp"
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
