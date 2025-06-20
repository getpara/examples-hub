import { Stack } from 'expo-router';

export default function TransactionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="token"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="status"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
