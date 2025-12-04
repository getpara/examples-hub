import { View, Text } from 'react-native';

interface DividerProps {
  text?: string;
}

export function Divider({ text }: DividerProps) {
  if (!text) {
    return <View className="my-4 h-px bg-gray-200" />;
  }

  return (
    <View className="my-6 flex-row items-center">
      <View className="h-px flex-1 bg-gray-200" />
      <Text className="mx-4 text-sm text-gray-500">{text}</Text>
      <View className="h-px flex-1 bg-gray-200" />
    </View>
  );
}
