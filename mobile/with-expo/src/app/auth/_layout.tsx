import React from 'react';
import { Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { AppHeader } from '@/components/navigation/AppHeader';
import { ArrowLeft } from '@/components/icons/ArrowLeft';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
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
          header: (props) => (
            <AppHeader>
              <AppHeader.Left>
                <Pressable
                  onPress={() => props.navigation.goBack()}
                  className="p-2 -ml-2"
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <ArrowLeft size={24} className="text-muted-foreground" />
                </Pressable>
              </AppHeader.Left>
            </AppHeader>
          ),
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
