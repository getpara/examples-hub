import { Tabs } from "expo-router";
import { Home } from "@/components/icons/Home";
import { Text } from "@/components/ui/text";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <Home className={`${focused ? "text-primary" : "text-gray-500"}`} />,
          tabBarLabel: ({ focused }) => (
            <Text className={`text-sm ${focused ? "text-primary" : "text-gray-500"}`}>Home</Text>
          ),
        }}
      />
    </Tabs>
  );
}
