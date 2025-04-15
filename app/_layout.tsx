import { Stack, Tabs, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { checkAuth, user, token } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, []);
  // handle navigation based on auth state
  useEffect(() => {
    const isAuthSegment = segments[0] === "(auth)";
    const isSignedIn = user && token;
    if (!isAuthSegment && !isSignedIn) {
      router.replace("/(auth)");
    } else if (isAuthSegment && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [token, user, segments]);
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen name="(tabs)" />
          <Tabs.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar barStyle="dark-content" />
    </SafeAreaProvider>
  );
}
