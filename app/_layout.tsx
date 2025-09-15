import { InsightNotification } from "@/components/InsightNotification";
import { InsightStreamProvider, useInsightStream } from "@/contexts/InsightStream";
import { Stack } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <InsightStreamProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <NotificationOverlay />
    </InsightStreamProvider>
  );
}

function NotificationOverlay() {
  const { notification, handleNotificationPress, handleNotificationDismiss } = useInsightStream();
  return (
    <InsightNotification
      message={notification.message}
      visible={notification.visible}
      onPress={handleNotificationPress}
      onDismiss={handleNotificationDismiss}
    />
  );
}
