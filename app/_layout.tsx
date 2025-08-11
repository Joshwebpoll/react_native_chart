import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ToastProvider } from "../components/toast";
import useAuthStore from "./store/useAuthStore";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const { isLoggedIn, fetchUserProfile, user, isLoading } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [loaded] = useFonts({
    MonoReg: require("../assets/fonts/Poppins-Regular.ttf"),
    MontMed: require("../assets/fonts/Poppins-Medium.ttf"),
    MontBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  useEffect(() => {
    const checkAuth = async () => {
      const result = await fetchUserProfile();

      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    // Hide splash screen when both fonts are loaded AND auth is checked
    if (loaded && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [loaded, authChecked]);

  // Keep splash screen visible while loading fonts or checking auth
  if (!loaded || !authChecked) {
    return null;
  }
  console.log(isLoggedIn, authChecked, "hello no");
  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="protectedRoute" />
        </Stack.Protected>
        {/* Expo Router includes all routes by default. Adding Stack.Protected creates exceptions for these screens. */}
      </Stack>
    </ToastProvider>
  );
}
