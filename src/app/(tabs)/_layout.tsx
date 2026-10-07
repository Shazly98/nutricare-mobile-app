import { Tabs } from "expo-router";
import { View } from "react-native";
import { FloatingWhatsApp } from "@/components/Footer";
import { MobileTabBar } from "@/components/MobileTabBar";
import { colors } from "@/theme";

const HIDDEN = ["cart", "checkout", "iherb", "product/[id]", "article/[slug]"];

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        backBehavior="history"
        tabBar={(props) => <MobileTabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="offers" />
        <Tabs.Screen name="products" />
        <Tabs.Screen name="bulletin" />
        <Tabs.Screen name="contact" />
        {HIDDEN.map((name) => (
          <Tabs.Screen key={name} name={name} options={{ href: null }} />
        ))}
      </Tabs>
      <FloatingWhatsApp />
    </View>
  );
}
