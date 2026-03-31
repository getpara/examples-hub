import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useIsFullyLoggedIn } from '@getpara/react-native-wallet';

export default function Index() {
  const { data: isAuthenticated, isLoading } = useIsFullyLoggedIn();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
}
