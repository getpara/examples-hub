import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { usePara } from '@/providers/ParaProvider';

export default function Index() {
  const { isAuthenticated, isLoading } = usePara();

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
