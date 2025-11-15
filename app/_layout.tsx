import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RecordProvider } from "./context/RecordContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="stylus" options={{ headerShown: false }} />
      <Stack.Screen name="now-playing" options={{ headerShown: false }} />
      <Stack.Screen name="screensaver" options={{ headerShown: false }} />
      <Stack.Screen name="collection" options={{ title: "My Collection" }} />
      <Stack.Screen name="settings" options={{ title: "Settings & Privacy" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RecordProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </RecordProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}