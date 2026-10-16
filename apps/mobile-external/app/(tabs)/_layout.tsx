import { Tabs } from "expo-router";
import { Briefcase, CalendarDays, CircleUser, Home } from "lucide-react-native";
import { View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/src/kit";

function TabGlyph({
  icon: Icon,
  color,
  focused,
}: {
  icon: typeof Home;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", minWidth: 48, minHeight: 48 }}>
      <Icon color={color} size={24} strokeWidth={2} />
      <View
        style={{
          marginTop: 4,
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: focused ? color : "transparent",
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.nav,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.canvas,
          borderTopWidth: 0,
          height: 56 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
          shadowColor: "#050621",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Notices",
          tabBarAccessibilityLabel: "Notices",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="awards"
        options={{
          title: "Awards",
          tabBarAccessibilityLabel: "Awards",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph icon={CalendarDays} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="bids"
        options={{
          title: "Bids",
          tabBarAccessibilityLabel: "Bids",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph icon={Briefcase} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: "You",
          tabBarAccessibilityLabel: "You",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph icon={CircleUser} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
