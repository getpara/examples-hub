import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="send"
        options={{
          title: 'Send',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'Account',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="smart-account"
        options={{
          title: 'Smart Account',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
